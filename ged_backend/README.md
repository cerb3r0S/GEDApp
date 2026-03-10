# GED - Gestion des permissions utilisateurs

## Permissions des utilisateurs

| Action / Route                                 | admin         | utilisateur (normal)                |
|------------------------------------------------|--------------|-------------------------------------|
| GET /api/users                                 | ✅ Oui        | ✅ Oui (seulement users de son département) |
| GET /api/users/:id                             | ✅ Oui        | ✅ Oui (lui-même ou user du même département) |
| GET /api/departments                           | ✅ Oui        | ❌ Non                              |
| GET /api/departments/:id                       | ✅ Oui        | ✅ Oui (seulement son propre département) |
| POST /api/departments                          | ✅ Oui        | ❌ Non                              |
| PUT /api/departments/:id                       | ✅ Oui        | ❌ Non                              |
| DELETE /api/departments/:id                    | ✅ Oui        | ❌ Non                              |

**Légende :**
- ✅ Oui : accès autorisé
- ❌ Non : accès refusé

**Résumé des règles :**
- L’admin a accès à tout (lecture, écriture, suppression).
- Un utilisateur normal :
  - Peut voir uniquement les utilisateurs de son département.
  - Peut voir un utilisateur par ID si c’est lui-même ou un membre de son département.
  - Peut voir son propre département (GET /api/departments/:id).
  - N’a pas accès à la liste de tous les départements, ni à la création/modification/suppression de départements (POST/PUT/DELETE).
