Protected Routes - when user has no access token they should not be able to access anything other than the sign in page - (if auth token === false ) show login automatically - do subscription check
update supabase calls to remove the service key/access and make it based on user access token where relevant. CreateContent(SUPABASE_URL, SUPABASE_ANON_KEY, {OPTIONS: {HEADERS: {AUTHORIZATION : req.headers.get("Authorization") ?? ""}}})
check logs for childen naming errors using duplicate key
in the add workout modal when you delete a nmber the disable save doesnt update automatically
