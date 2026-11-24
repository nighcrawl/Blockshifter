## Agent skills

### Issue tracker

Issues suivies sur GitHub (`nighcrawl/Blockshifter`) via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Labels par défaut (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Layout single-context — CONTEXT.md + docs/adr/ à la racine. See `docs/agents/domain.md`.

## Test manuel

WordPress de test local : http://localhost:10005/wp-admin/ (à piloter avec Chrome). Le plugin y est installé via un lien symbolique vers `dist/blockshifter/` (le paquet construit, pas la racine du dépôt — ne jamais changer ce lien). Pour tester la branche courante : `bin/build-wporg-package.sh` (rebuild JS + recopie dans `dist/blockshifter/`), puis recharger la page. Vérifier sur le front que les assets Blockshifter sont servis en `?ver=<version courante>` avant de conclure qu'on teste le bon code (la page Extensions relit le fichier sur disque et peut afficher la nouvelle version alors que PHP exécute encore l'ancien code).
