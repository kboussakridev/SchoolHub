import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headerPayload = request.headers;
    
    // Optionnel : Vérification des signatures svix en production
    const svixId = headerPayload.get("svix-id");
    const svixSignature = headerPayload.get("svix-signature");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    
    if (!svixId || !svixSignature || !svixTimestamp) {
      return new Response("Headers svix manquants", { status: 400 });
    }
    
    let payload;
    try {
      payload = JSON.parse(payloadString);
    } catch (err) {
      return new Response("JSON invalide", { status: 400 });
    }

    const { type, data } = payload;
    
    switch (type) {
      case "user.created":
      case "user.updated": {
        const email = data.email_addresses?.[0]?.email_address || "";
        const name = `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Utilisateur SchoolHub";
        const imageUrl = data.image_url || "";
        
        // Rôle par défaut, l'adresse du propriétaire devient automatiquement Admin
        let role = data.public_metadata?.role || "student";
        if (email === "boussakri.karim@gmail.com") {
          role = "admin";
        }
        
        // Synchroniser dans la table "users" de Convex
        await ctx.runMutation(api.users.syncUser, {
          clerkId: data.id,
          email,
          name,
          imageUrl,
          role,
        });
        break;
      }
      
      case "user.deleted": {
        // En cas de suppression de compte, on peut facultativement désactiver le profil
        console.log(`Utilisateur Clerk supprimé : ${data.id}`);
        break;
      }
    }
    
    return new Response("Webhook Clerk traité", { status: 200 });
  }),
});

export default http;
