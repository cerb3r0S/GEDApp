import { DBconnect } from '../config/database.js';
import User from '../models/User.js';

async function promote(email) {
  if (!email) {
    console.error('Usage: node scripts/promoteUser.js user@example.com');
    process.exit(1);
  }

  await DBconnect();

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`Utilisateur non trouvé pour l'email: ${email}`);
    process.exit(1);
  }

  user.role = 'admin';
  await user.save();

  console.log(`Utilisateur ${email} promu en admin avec succès.`);
  console.log({ id: user._id, email: user.email, role: user.role });
  process.exit(0);
}

const email = process.argv[2];
promote(email).catch(err => {
  console.error('Erreur:', err.message);
  process.exit(1);
});
