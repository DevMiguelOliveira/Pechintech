-- Function to increment vote count
CREATE OR REPLACE FUNCTION public.increment_vote(p_product_id uuid, p_vote_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_vote_type = 'hot' THEN
    UPDATE public.products 
    SET hot_votes = hot_votes + 1,
        temperature = LEAST(100, temperature + 2)
    WHERE id = p_product_id;
  ELSE
    UPDATE public.products 
    SET cold_votes = cold_votes + 1,
        temperature = GREATEST(0, temperature - 2)
    WHERE id = p_product_id;
  END IF;
END;
$$;

-- Function to decrement vote count
CREATE OR REPLACE FUNCTION public.decrement_vote(p_product_id uuid, p_vote_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_vote_type = 'hot' THEN
    UPDATE public.products 
    SET hot_votes = GREATEST(0, hot_votes - 1),
        temperature = GREATEST(0, temperature - 2)
    WHERE id = p_product_id;
  ELSE
    UPDATE public.products 
    SET cold_votes = GREATEST(0, cold_votes - 1),
        temperature = LEAST(100, temperature + 2)
    WHERE id = p_product_id;
  END IF;
END;
$$;

-- Function to change vote type
CREATE OR REPLACE FUNCTION public.change_vote(p_product_id uuid, p_old_vote_type text, p_new_vote_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_old_vote_type = 'hot' THEN
    -- Was hot, now cold
    UPDATE public.products 
    SET hot_votes = GREATEST(0, hot_votes - 1),
        cold_votes = cold_votes + 1,
        temperature = GREATEST(0, temperature - 4)
    WHERE id = p_product_id;
  ELSE
    -- Was cold, now hot
    UPDATE public.products 
    SET cold_votes = GREATEST(0, cold_votes - 1),
        hot_votes = hot_votes + 1,
        temperature = LEAST(100, temperature + 4)
    WHERE id = p_product_id;
  END IF;
END;
$$;

-- Function to increment comments count
CREATE OR REPLACE FUNCTION public.increment_comments(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products 
  SET comments_count = comments_count + 1
  WHERE id = p_product_id;
END;
$$;

-- Function to decrement comments count
CREATE OR REPLACE FUNCTION public.decrement_comments(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products 
  SET comments_count = GREATEST(0, comments_count - 1)
  WHERE id = p_product_id;
END;
$$;