


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."add_auth_user_to_user_table"() RETURNS "void"
    LANGUAGE "sql"
    AS $$
INSERT INTO public.user (user_id, email)
SELECT id, email FROM auth.users
ON CONFLICT(user_id)
DO UPDATE SET
user_id = EXCLUDED.user_id;
$$;


ALTER FUNCTION "public"."add_auth_user_to_user_table"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_daily_scores"("passed_session_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$BEGIN
IF EXISTS(
  SELECT 1 from public.sets
  WHERE session_id = passed_session_id
  AND (reps <= 0 OR weight < 0)
) THEN RAISE EXCEPTION 'Invalid Data: Reps must be atleast 1 and Weight must be atleast 0';
END IF;
INSERT INTO public.fitness_scores (session_id, user_id, total_daily_volume, adjusted_daily_volume)
SELECT session_id, user_id, COALESCE(SUM(set_volume), 0), COALESCE(SUM(reps * weight * CASE
 WHEN reps BETWEEN 1 AND 5 THEN 0.9
    WHEN reps BETWEEN 6 AND 8 THEN 1
    WHEN reps BETWEEN 9 AND 12 THEN 1.1
    WHEN reps BETWEEN 13 AND 15 THEN 1
    WHEN reps BETWEEN 16 AND 20 THEN 0.9
    WHEN reps >= 21 THEN 0.8
    ELSE 1
  END), 0) 
FROM public.sets
WHERE passed_session_id = session_id
GROUP BY session_id, user_id
ON CONFLICT (session_id)
DO UPDATE set
total_daily_volume = EXCLUDED.total_daily_volume,
adjusted_daily_volume = EXCLUDED.adjusted_daily_volume;
END;$$;


ALTER FUNCTION "public"."calculate_daily_scores"("passed_session_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_refresh_fitness_scores"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM calculate_daily_scores(NEW.session_id);
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
  PERFORM calculate_daily_scores(NEW.session_id);

    IF OLD.session_id IS DISTINCT FROM NEW.session_id THEN
     PERFORM calculate_daily_scores(OLD.session_id);
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF EXISTS (SELECT 1 FROM public.session WHERE session_id = OLD.session_id) THEN
      PERFORM calculate_daily_scores(OLD.session_id);
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;$$;


ALTER FUNCTION "public"."handle_refresh_fitness_scores"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."refresh_user_table"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
IF TG_OP = 'INSERT' THEN
PERFORM public.add_auth_user_to_user_table();
RETURN NEW;
END IF;
RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."refresh_user_table"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."exercise" (
    "exercise_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "exercise_name" "text",
    "body_part" "text",
    "equipment" "text",
    "external_id" "text",
    "source" "text",
    "media_url_ref" "text"
);


ALTER TABLE "public"."exercise" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fitness_scores" (
    "total_daily_volume" numeric,
    "adjusted_daily_volume" numeric,
    "session_id" "uuid" NOT NULL,
    "user_id" "uuid"
);


ALTER TABLE "public"."fitness_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session" (
    "session_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_date" "date" DEFAULT (("now"() AT TIME ZONE 'utc'::"text"))::"date"
);


ALTER TABLE "public"."session" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sets" (
    "set_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "reps" numeric,
    "weight" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_id" "uuid",
    "exercise_id" "uuid",
    "set_number" numeric,
    "user_id" "uuid",
    "set_volume" numeric GENERATED ALWAYS AS (("reps" * "weight")) STORED
);


ALTER TABLE "public"."sets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user" (
    "user_id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user" OWNER TO "postgres";


COMMENT ON TABLE "public"."user" IS 'user info';



ALTER TABLE ONLY "public"."exercise"
    ADD CONSTRAINT "exercise_pkey" PRIMARY KEY ("exercise_id");



ALTER TABLE ONLY "public"."exercise"
    ADD CONSTRAINT "external_id_key" UNIQUE ("external_id");



ALTER TABLE ONLY "public"."fitness_scores"
    ADD CONSTRAINT "fitness_scores_pkey" PRIMARY KEY ("session_id");



ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "one_session_per_day" UNIQUE ("user_id", "session_date");



ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("session_id");



ALTER TABLE ONLY "public"."sets"
    ADD CONSTRAINT "sets_pkey" PRIMARY KEY ("set_id");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("user_id");



CREATE OR REPLACE TRIGGER "update_scores" AFTER INSERT OR DELETE OR UPDATE ON "public"."sets" FOR EACH ROW EXECUTE FUNCTION "public"."handle_refresh_fitness_scores"();



ALTER TABLE ONLY "public"."fitness_scores"
    ADD CONSTRAINT "fitness_scores_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("session_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fitness_scores"
    ADD CONSTRAINT "fitness_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sets"
    ADD CONSTRAINT "sets_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise"("exercise_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sets"
    ADD CONSTRAINT "sets_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("session_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sets"
    ADD CONSTRAINT "sets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Enable delete for users based on user_id" ON "public"."session" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."fitness_scores" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."session" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."sets" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "public"."user" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."exercise" FOR SELECT USING (true);



CREATE POLICY "Enable update for users based on user_id" ON "public"."fitness_scores" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."fitness_scores" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."session" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."sets" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."user" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."exercise" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fitness_scores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."session" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."add_auth_user_to_user_table"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_auth_user_to_user_table"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_auth_user_to_user_table"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_daily_scores"("passed_session_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_daily_scores"("passed_session_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_daily_scores"("passed_session_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_refresh_fitness_scores"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_refresh_fitness_scores"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_refresh_fitness_scores"() TO "service_role";



GRANT ALL ON FUNCTION "public"."refresh_user_table"() TO "anon";
GRANT ALL ON FUNCTION "public"."refresh_user_table"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."refresh_user_table"() TO "service_role";



GRANT ALL ON TABLE "public"."exercise" TO "anon";
GRANT ALL ON TABLE "public"."exercise" TO "authenticated";
GRANT ALL ON TABLE "public"."exercise" TO "service_role";



GRANT ALL ON TABLE "public"."fitness_scores" TO "anon";
GRANT ALL ON TABLE "public"."fitness_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."fitness_scores" TO "service_role";



GRANT ALL ON TABLE "public"."session" TO "anon";
GRANT ALL ON TABLE "public"."session" TO "authenticated";
GRANT ALL ON TABLE "public"."session" TO "service_role";



GRANT ALL ON TABLE "public"."sets" TO "anon";
GRANT ALL ON TABLE "public"."sets" TO "authenticated";
GRANT ALL ON TABLE "public"."sets" TO "service_role";



GRANT ALL ON TABLE "public"."user" TO "anon";
GRANT ALL ON TABLE "public"."user" TO "authenticated";
GRANT ALL ON TABLE "public"."user" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







