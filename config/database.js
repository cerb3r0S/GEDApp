import mongoose from "mongoose";

export async function DBconnect() {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ged_database";
        await mongoose.connect(uri);
        console.log("✅ MongoDB connecté avec succès");
    } catch (err) {
        console.error("❌ Erreur MongoDB:", err);
        process.exit(1);
    }
}