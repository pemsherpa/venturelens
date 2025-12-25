-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('vc', 'founder');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create startups table (for founders)
CREATE TABLE public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  stage TEXT,
  funding_raised TEXT,
  website_url TEXT,
  deck_url TEXT,
  ai_score INTEGER DEFAULT 0,
  trust_signal TEXT DEFAULT 'weak',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create startup_anomalies table
CREATE TABLE public.startup_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('verified', 'warning', 'critical')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table for AI chat
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles RLS policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role during signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Startups RLS policies
CREATE POLICY "Founders can view own startups"
  ON public.startups FOR SELECT
  USING (auth.uid() = founder_id);

CREATE POLICY "VCs can view all startups"
  ON public.startups FOR SELECT
  USING (public.has_role(auth.uid(), 'vc'));

CREATE POLICY "Founders can create own startups"
  ON public.startups FOR INSERT
  WITH CHECK (auth.uid() = founder_id AND public.has_role(auth.uid(), 'founder'));

CREATE POLICY "Founders can update own startups"
  ON public.startups FOR UPDATE
  USING (auth.uid() = founder_id);

CREATE POLICY "Founders can delete own startups"
  ON public.startups FOR DELETE
  USING (auth.uid() = founder_id);

-- Startup anomalies RLS policies
CREATE POLICY "Founders can view own startup anomalies"
  ON public.startup_anomalies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.startups 
    WHERE startups.id = startup_anomalies.startup_id 
    AND startups.founder_id = auth.uid()
  ));

CREATE POLICY "VCs can view all anomalies"
  ON public.startup_anomalies FOR SELECT
  USING (public.has_role(auth.uid(), 'vc'));

-- Chat messages RLS policies
CREATE POLICY "Users can view own messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_startups_updated_at
  BEFORE UPDATE ON public.startups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();