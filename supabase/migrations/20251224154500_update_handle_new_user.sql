-- Update the handle_new_user function to also insert into user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  -- Insert into user_roles
  -- We use the role from metadata, defaulting to 'founder' if not provided
  -- Casting to app_role ensures type safety
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    (COALESCE(NEW.raw_user_meta_data->>'role', 'founder'))::public.app_role
  );

  RETURN NEW;
END;
$$;
