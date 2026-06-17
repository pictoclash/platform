# Page Routes

Priorities: unstyled first unless low prio, then styled
Upgrade path: unstyled -> styled -> responsive

| Path | State | TODO |
|------|-------|-------|
| `/` | responsive | random/smartrandom needs to be implemented still |
| `/login` | responsive | supports username or email login |
| `/register` | responsive | |
| `/profile` | responsive | |
| `/notifications` | responsive | |
| `/event` | responsive | |
| `/user/[username]` | responsive | |
| `/characters/new` | responsive | |
| `/characters/[username]/[slug]` | responsive | |
| `/characters/[username]/[slug]/edit` | responsive | TODO: character name is capitalised in edit mode but not in view mode, remove uppercasing in edit mode |
| `/strikes/new` | responsive | writing mode could use real time markdown |
| `/strikes/[id]` | responsive | center back button; if strike created by active user, add buttons to retract strike (deletes strike and removes points if in active checkpoint, if checkpoint has passed keep points) |
| `/admin` | unstyled | low prio |
| `/admin/events` | unstyled | low prio |
| `/admin/events/new` | unstyled | low prio; truncate user list, fetch only number of users; turn actions at checkpoints into trigger early and reveal button depending on state |
| `/admin/events/[id]` | unstyled | low prio |
| `/admin/events/[id]/edit` | unstyled | low prio; enforce good contrast on the colours |
| `/admin/reports` | unstyled | low prio |
| `/admin/users` | unstyled | low prio |
