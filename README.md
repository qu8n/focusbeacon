## Update Supabase types using the CLI

**Initialize a local Supabase project:** (only needs to be done once)

```zsh
$ npx supabase login
$ npx supabase init
```

This will create a `supabase` directory in your project.

**Automatically generate TypeScript types for your Supabase tables:**

```zsh
$ npm run supabase-typegen
```

Note that this script only works on Linux/MacOS because of the way it accesses `.env` file.
