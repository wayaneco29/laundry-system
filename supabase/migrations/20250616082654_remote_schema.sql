

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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."order_status_enum" AS ENUM (
    'Pending',
    'Ongoing',
    'Ready for Pickup',
    'Picked up'
);


ALTER TYPE "public"."order_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."payment_status_enum" AS ENUM (
    'Paid',
    'Unpaid'
);


ALTER TYPE "public"."payment_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."promo_status_enum" AS ENUM (
    'Pending',
    'Active',
    'Expired',
    'Closed',
    'Deleted'
);


ALTER TYPE "public"."promo_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."service_status_enum" AS ENUM (
    'Active',
    'Inactive'
);


ALTER TYPE "public"."service_status_enum" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_customer_order"("p_branch_id" "uuid", "p_customer_id" "uuid", "p_order_status" "public"."order_status_enum", "p_order_date" timestamp without time zone, "p_payment_status" "public"."payment_status_enum", "p_total_price" integer, "p_items" "jsonb"[], "p_staff_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
  p_order_id text;
begin
  select order_id into p_order_id from add_orders(p_branch_id, p_customer_id, p_order_status, p_staff_id);
  perform add_sales(p_order_id, p_branch_id, p_total_price, p_items, p_staff_id);
end;
$$;


ALTER FUNCTION "public"."add_customer_order"("p_branch_id" "uuid", "p_customer_id" "uuid", "p_order_status" "public"."order_status_enum", "p_order_date" timestamp without time zone, "p_payment_status" "public"."payment_status_enum", "p_total_price" integer, "p_items" "jsonb"[], "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_orders"("p_branch_id" "uuid", "p_customer_id" "uuid", "p_status" "public"."order_status_enum", "p_staff_id" "uuid") RETURNS TABLE("order_id" "text")
    LANGUAGE "plpgsql"
    AS $$
declare
  p_order_id text;
begin
  insert into orders(
    customer_id,
    branch_id,
    status,
    created_by,
    updated_by
  ) values(
    p_customer_id,
    p_branch_id,
    p_status,
    p_staff_id,
    p_Staff_id
  ) returning orders.order_id into p_order_id;

  return query select p_order_id;
end;
$$;


ALTER FUNCTION "public"."add_orders"("p_branch_id" "uuid", "p_customer_id" "uuid", "p_status" "public"."order_status_enum", "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_sales"("p_order_id" "text", "p_branch_id" "uuid", "p_total_price" integer, "p_items" "jsonb"[], "p_staff_id" "uuid") RETURNS TABLE("id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
declare
  p_sales_id uuid;
begin
  insert into sales(
    order_id,
    branch_id,
    total_price,
    items,
    created_by,
    updated_by
  ) values(
    p_order_id,
    p_branch_id,
    p_total_price,
    p_items,
    p_staff_id,
    p_staff_id
  ) returning sales.id into p_sales_id;

  return query select p_sales_id;
end;
$$;


ALTER FUNCTION "public"."add_sales"("p_order_id" "text", "p_branch_id" "uuid", "p_total_price" integer, "p_items" "jsonb"[], "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_next_order_id"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
  next_num integer;
  formatted_id text;
BEGIN
  -- Get the highest order number from existing orders
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN order_id ~ '^ORD_[0-9]+$' 
        THEN CAST(SUBSTRING(order_id FROM 5) AS integer)
        ELSE 0
      END
    ), 0
  ) + 1 INTO next_num
  FROM orders;
  
  -- Format with leading zeros (7 digits)
  formatted_id := 'ORD_' || LPAD(next_num::text, 7, '0');
  
  RETURN formatted_id;
END;
$_$;


ALTER FUNCTION "public"."generate_next_order_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_customer_summary"("p_customer_id" "uuid") RETURNS TABLE("customer_id" "uuid", "full_name" "text", "total_orders" bigint, "total_spent" numeric, "avg_order_value" numeric, "last_order_date" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.customer_id,
    c.full_name,
    COUNT(o.order_id) as total_orders,
    COALESCE(SUM(o.total_price), 0) as total_spent,
    COALESCE(AVG(o.total_price), 0) as avg_order_value,
    MAX(o.order_date) as last_order_date
  FROM view_customers c
  LEFT JOIN view_orders o ON c.customer_id = o.customer_id
  WHERE c.customer_id = p_customer_id
  GROUP BY c.customer_id, c.full_name;
END;
$$;


ALTER FUNCTION "public"."get_customer_summary"("p_customer_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_low_stock_items"("p_threshold" integer DEFAULT 10) RETURNS TABLE("branch_id" "uuid", "branch_name" "text", "item_name" "text", "current_quantity" integer, "status" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as branch_id,
    b.name as branch_name,
    stock_item.name as item_name,
    stock_item.quantity as current_quantity,
    CASE 
      WHEN stock_item.quantity = 0 THEN 'Out of Stock'
      WHEN stock_item.quantity <= p_threshold / 2 THEN 'Critical'
      ELSE 'Low Stock'
    END as status
  FROM view_branches b,
  jsonb_to_recordset(b.branch_stocks) as stock_item(
    id uuid,
    name text,
    quantity integer
  )
  WHERE 
    stock_item.quantity IS NOT NULL 
    AND stock_item.name IS NOT NULL
    AND stock_item.quantity <= p_threshold
  ORDER BY stock_item.quantity ASC, b.name;
END;
$$;


ALTER FUNCTION "public"."get_low_stock_items"("p_threshold" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_order_stats"("p_start_date" "date", "p_end_date" "date", "p_branch_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("total_orders" bigint, "total_revenue" numeric, "avg_order_value" numeric, "paid_orders" bigint, "unpaid_orders" bigint, "pending_orders" bigint, "completed_orders" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_orders,
    COALESCE(SUM(o.total_price), 0) as total_revenue,
    COALESCE(AVG(o.total_price), 0) as avg_order_value,
    COUNT(CASE WHEN o.payment_status = 'Paid' THEN 1 END) as paid_orders,
    COUNT(CASE WHEN o.payment_status = 'Unpaid' THEN 1 END) as unpaid_orders,
    COUNT(CASE WHEN o.order_status IN ('Pending', 'Ongoing') THEN 1 END) as pending_orders,
    COUNT(CASE WHEN o.order_status = 'Picked up' THEN 1 END) as completed_orders
  FROM view_orders o
  WHERE 
    DATE(o.order_date) >= p_start_date 
    AND DATE(o.order_date) <= p_end_date
    AND (p_branch_id IS NULL OR o.branch_id = p_branch_id);
END;
$$;


ALTER FUNCTION "public"."get_order_stats"("p_start_date" "date", "p_end_date" "date", "p_branch_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_recent_orders"("p_limit" integer DEFAULT 10) RETURNS TABLE("order_id" "text", "customer_name" "text", "branch_name" "text", "order_status" "text", "payment_status" "text", "total_price" numeric, "order_date" timestamp with time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.order_id,
    o.customer_name,
    o.branch_name,
    o.order_status,
    o.payment_status,
    o.total_price,
    o.order_date
  FROM view_orders o
  ORDER BY o.order_date DESC
  LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_recent_orders"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_service_popularity"("p_limit" integer DEFAULT 10) RETURNS TABLE("service_id" "uuid", "service_name" "text", "branch_name" "text", "price" numeric, "order_count" bigint, "total_quantity" bigint, "total_revenue" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as service_id,
    s.name as service_name,
    s.branch_name,
    s.price,
    COUNT(order_item.service_id) as order_count,
    COALESCE(SUM((order_item.quantity)::integer), 0) as total_quantity,
    COALESCE(SUM(order_item.total), 0) as total_revenue
  FROM view_services s
  LEFT JOIN (
    SELECT 
      (item->>'id')::uuid as service_id,
      item->>'quantity' as quantity,
      (item->>'total')::numeric as total
    FROM view_orders o,
    jsonb_array_elements(o.items) as item
  ) order_item ON s.id = order_item.service_id
  GROUP BY s.id, s.name, s.branch_name, s.price
  ORDER BY order_count DESC, total_revenue DESC
  LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_service_popularity"("p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_customers_basic"("p_search_term" "text", "p_limit" integer DEFAULT 20) RETURNS TABLE("customer_id" "uuid", "full_name" "text", "phone" "text", "email" "text", "address" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.customer_id,
    c.full_name,
    c.phone,
    c.email,
    c.address
  FROM view_customers c
  WHERE 
    c.full_name ILIKE '%' || p_search_term || '%' OR
    c.phone ILIKE '%' || p_search_term || '%' OR
    c.email ILIKE '%' || p_search_term || '%'
  ORDER BY 
    CASE 
      WHEN c.full_name ILIKE p_search_term || '%' THEN 1
      WHEN c.phone ILIKE p_search_term || '%' THEN 2
      ELSE 3
    END,
    c.full_name
  LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."search_customers_basic"("p_search_term" "text", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_order_id"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.order_id IS NULL THEN
    NEW.order_id := 'ORD_' || LPAD(nextval('order_number_seq')::TEXT, 7, '0');
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_order_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_order_status"("p_order_id" "text", "p_order_status" "public"."order_status_enum", "p_staff_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update orders
  set
    status = p_order_status,
    updated_by = p_staff_id,
    updated_at = (now() at time zone 'utc')
  where
    orders.order_id = p_order_id;
end;
$$;


ALTER FUNCTION "public"."update_order_status"("p_order_id" "text", "p_order_status" "public"."order_status_enum", "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_payment_status"("p_order_id" "text", "p_payment_status" "public"."payment_status_enum", "p_staff_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  UPDATE sales
  set
    status = p_payment_status,
    updated_by = p_staff_id,
    updated_at = (now() at time zone 'utc')
  where
    order_id = p_order_id;
end;
$$;


ALTER FUNCTION "public"."update_payment_status"("p_order_id" "text", "p_payment_status" "public"."payment_status_enum", "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_sales_status"("p_order_id" "uuid", "p_status" "public"."payment_status_enum", "p_staff_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  update sales
  set
    status = p_status,
    updated_by = p_staff_id,
    updated_at = (now() at time zone 'utc')
  where
    order_id = p_order_id;
end;
$$;


ALTER FUNCTION "public"."update_sales_status"("p_order_id" "uuid", "p_status" "public"."payment_status_enum", "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_branch"("p_branch_id" "uuid", "p_name" "text", "p_description" "text", "p_address" "text", "p_staff_id" "uuid") RETURNS TABLE("id" "uuid", "name" "text", "description" "text", "address" "text")
    LANGUAGE "plpgsql"
    AS $$
begin
  if p_branch_id is null then
    return query
      insert into branches (
      name,
      description,
      address,
      created_by,
      updated_by
    ) values (
      p_name,
      p_description,
      p_address,
      p_staff_id,
      p_staff_id
    )
    returning branches.id, branches.name, branches.description, branches.address;
  else
  update branches
  set
    name          = p_name,
    description   = p_description,
    address       = p_address,
    updated_by    = p_staff_id,
    updated_at    = (now() at time zone 'Asia/Manila')
  where
    branches.id = p_branch_id;

  return query
    select
      branches.id,
      branches.name,
      branches.description,
      branches.address
    from
      branches
    where
      branches.id = p_branch_id;
  end if;
end;
$$;


ALTER FUNCTION "public"."upsert_branch"("p_branch_id" "uuid", "p_name" "text", "p_description" "text", "p_address" "text", "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_branch_stocks"("p_stock_id" "uuid", "p_name" "text", "p_quantity" integer, "p_branch_id" "uuid", "p_created_by" "uuid") RETURNS TABLE("id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
declare
  new_stock_id uuid;
begin
  select stock_id into new_stock_id from upsert_stocks(
    p_stock_id,
    p_name,
    p_quantity,
    p_created_by
  );

  insert into branch_stocks (
    stock_id,
    branch_id,
    created_by,
    updated_by
  ) values (
    new_stock_id,
    p_branch_id,
    p_created_by,
    p_created_by
  )
  on conflict (stock_id, branch_id) do nothing;

  return query select new_stock_id;
end;
$$;


ALTER FUNCTION "public"."upsert_branch_stocks"("p_stock_id" "uuid", "p_name" "text", "p_quantity" integer, "p_branch_id" "uuid", "p_created_by" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_customer"("p_customer_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_staff_id" "uuid") RETURNS TABLE("id" "uuid", "first_name" "text", "middle_name" "text", "last_name" "text", "phone" "text", "email" "text", "address" "text")
    LANGUAGE "plpgsql"
    AS $$
begin
  if p_customer_id is null then
     return query
     insert into customers(
      first_name,
      middle_name,
      last_name,
      phone,
      email,
      address,
      created_by,
      updated_by
     ) values (
      p_first_name,
      p_middle_name,
      p_last_name,
      p_phone,
      p_email,
      p_address,
      p_staff_id,
      p_staff_id
     ) returning customers.id as customer_id, customers.first_name, customers.middle_name, customers.last_name, customers.phone, customers.email, customers.address;
  else
    update customers
    set
      first_name       = p_first_name,
      middle_name      = p_middle_name,
      last_name        = p_last_name,
      phone            = p_phone,
      email            = p_email,
      address          = p_address,
      updated_by       = p_staff_id,
      updated_at       = (now() at time zone 'Asia/Manila'::text)
    where customers.id = p_customer_id;

    return query
    select
      customers.id as customer_id,
      customers.first_name,
      customers.middle_name,
      customers.last_name,
      customers.phone,
      customers.email,
      customers.address
    from
      customers
    where
      customers.id = p_customer_id;
    end if;
end;
$$;


ALTER FUNCTION "public"."upsert_customer"("p_customer_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_promo"("p_promo_id" "uuid", "p_name" "text", "p_code" "text", "p_description" "text", "p_valid_until" timestamp without time zone, "p_status" "public"."promo_status_enum", "p_staff_id" "uuid") RETURNS TABLE("promo_id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
declare
  promo_id uuid;
begin
  if p_promo_id is not null then
    update promos
    set
      name = p_name,
      code = p_code,
      description = p_description,
      valid_until = p_valid_until,
      status = p_status,
      updated_by = p_staff_id
    where id = p_promo_id;

    promo_id := p_promo_id;

  -- If inserting a new promo
  else
    insert into promos (
      name,
      code,
      description,
      valid_until,
      status,
      created_by,
      updated_by
    )
    values (
      p_name,
      p_code,
      p_description,
      p_valid_until,
      p_status,
      p_staff_id,
      p_staff_id
    )
    returning id into promo_id;
  end if;

  return query select promo_id;
end;
$$;


ALTER FUNCTION "public"."upsert_promo"("p_promo_id" "uuid", "p_name" "text", "p_code" "text", "p_description" "text", "p_valid_until" timestamp without time zone, "p_status" "public"."promo_status_enum", "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_promo"("p_promo_id" "uuid", "p_name" "text", "p_code" "text", "p_description" "text", "p_valid_until" timestamp without time zone, "p_status" "public"."promo_status_enum", "p_branches" "uuid"[], "p_staff_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_promo_id uuid;
  p_branch_item uuid;
begin
  if p_promo_id is not null then
    update promos
    set
      name = p_name,
      code = p_code,
      description = p_description,
      valid_until = p_valid_until,
      status = p_status,
      updated_by = p_staff_id
    where id = p_promo_id;

    v_promo_id := p_promo_id;

  -- If inserting a new promo
  else
    insert into promos (
      name,
      code,
      description,
      valid_until,
      status,
      created_by,
      updated_by
    )
    values (
      p_name,
      p_code,
      p_description,
      p_valid_until,
      p_status,
      p_staff_id,
      p_staff_id
    )
    returning id into v_promo_id;
  end if;

  foreach p_branch_item in array p_branches loop
    perform upsert_promo_branch(
      v_promo_id,
      p_branch_item,
      p_staff_id
    );
  end loop;
end;
$$;


ALTER FUNCTION "public"."upsert_promo"("p_promo_id" "uuid", "p_name" "text", "p_code" "text", "p_description" "text", "p_valid_until" timestamp without time zone, "p_status" "public"."promo_status_enum", "p_branches" "uuid"[], "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_promo_branch"("p_promo_id" "uuid", "p_branch_id" "uuid", "p_staff_id" "uuid") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  upserted_id UUID;
BEGIN
  INSERT INTO promo_branches (
    promo_id,
    branch_id,
    created_by,
    updated_by
  )
  VALUES (
    p_promo_id,
    p_branch_id,
    p_staff_id,
    p_staff_id
  )
  ON CONFLICT (promo_id, branch_id) DO UPDATE
  SET
    updated_by = EXCLUDED.updated_by,
    updated_at = now() AT TIME ZONE 'Asia/Manila'
  RETURNING id INTO upserted_id;

  RETURN upserted_id;
END;
$$;


ALTER FUNCTION "public"."upsert_promo_branch"("p_promo_id" "uuid", "p_branch_id" "uuid", "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_sales"("p_order_id" "uuid", "p_branch_id" "uuid", "p_status" "public"."payment_status_enum", "p_price" "text", "p_items" "jsonb"[], "p_staff_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  insert into sales(
    order_id,
    branch_id,
    status,
    price,
    items,
    created_by,
    updated_by
  ) values(
    p_order_id,
    p_branch_id,
    p_status,
    p_price,
    p_items,
    p_staff_id,
    p_staff_id
  ) on conflict(order_id, branch_id) do update
  set
    status = p_status,
    updated_by = p_staff_id,
    updated_at = (now() at time zone 'utc');
end;
$$;


ALTER FUNCTION "public"."upsert_sales"("p_order_id" "uuid", "p_branch_id" "uuid", "p_status" "public"."payment_status_enum", "p_price" "text", "p_items" "jsonb"[], "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_service"("p_service_id" "uuid", "p_branch_id" "uuid", "p_name" "text", "p_price" integer, "p_status" "public"."service_status_enum", "p_staff_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
begin
  if p_service_id is null then
    insert into services(
      branch_id,
      status,
      name,
      price,
      created_by,
      updated_by
    ) values(
      p_branch_id,
      p_status,
      p_name,
      p_price,
      p_staff_id,
      p_staff_id
    );
  else
    update services
    set
      status = p_status,
      name = p_name,
      price = p_price,
      updated_by = p_staff_id,
      updated_at = (now() at time zone 'utc')
    where
      id = p_service_id;
  end if;
end;
$$;


ALTER FUNCTION "public"."upsert_service"("p_service_id" "uuid", "p_branch_id" "uuid", "p_name" "text", "p_price" integer, "p_status" "public"."service_status_enum", "p_staff_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_branch_id" "uuid") RETURNS TABLE("id" "uuid", "firstname" "text", "middle_name" "text", "last_name" "text", "phone" "text", "email" "text", "address" "text")
    LANGUAGE "plpgsql"
    AS $$
begin
  if p_staff_id is null then
    return query
      insert into staffs (
        first_name,
        middle_name,
        last_name,
        phone,
        email,
        address,
        branch_id
      ) values (
        p_first_name,
        p_middle_name,
        p_last_name,
        p_phone,
        p_email,
        p_address,
        p_branch_id
      )
      returning staffs.id, staffs.first_name, staffs.middle_name, staffs.last_name, staffs.phone, staffs.email, staffs.address;
  else
    update staffs
    set
      first_name        = p_first_name,
      middle_name       = p_middle_name,
      last_name         = p_last_name,
      phone             = p_phone,
      email             = p_email,
      address           = p_address
    where
      id                = p_staff_id;

    return query
      select
        staffs.id,
        staffs.first_name,
        staffs.middle_name,
        staffs.last_name,
        staffs.phone,
        staffs.email,
        staffs.address
      from staffs
      where id = p_staff_id;
  end if;
end;
$$;


ALTER FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_branch_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_employment_date" "text", "p_created_by" "uuid") RETURNS TABLE("id" "uuid", "firstname" "text", "middle_name" "text", "last_name" "text", "phone" "text", "email" "text", "address" "text", "employment_date" "text")
    LANGUAGE "plpgsql"
    AS $$
begin
  if p_staff_id is null then
    return query
      insert into staffs (
        first_name,
        middle_name,
        last_name,
        phone,
        email,
        address,
        employment_date,
        created_by,
        updated_by
      ) values (
        p_first_name,
        p_middle_name,
        p_last_name,
        p_phone,
        p_email,
        p_address,
        p_employment_date,
        p_created_by,
        p_created_by
      )

      returning staffs.id as staff_id, staffs.first_name, staffs.middle_name, staffs.last_name, staffs.phone, staffs.email, staffs.address, staffs.employment_date;
  else
    update staffs
    set
      first_name        = p_first_name,
      middle_name       = p_middle_name,
      last_name         = p_last_name,
      phone             = p_phone,
      email             = p_email,
      address           = p_address,
      employment_date   = p_employment_date,
      updated_by        = p_created_by
    where
      staffs.id         = p_staff_id;

    return query
      select
        staffs.id as staff_id,
        staffs.first_name,
        staffs.middle_name,
        staffs.last_name,
        staffs.phone,
        staffs.email,
        staffs.address,
        staffs.employment_date
      from staffs
      where staffs.id = p_staff_id;
  end if;
end;
$$;


ALTER FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_employment_date" "text", "p_created_by" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_branch_id" "uuid", "p_created_by" "uuid") RETURNS TABLE("id" "uuid", "firstname" "text", "middle_name" "text", "last_name" "text", "phone" "text", "email" "text", "address" "text")
    LANGUAGE "plpgsql"
    AS $$
begin
  if p_staff_id is null then
    return query
      insert into staffs (
        first_name,
        middle_name,
        last_name,
        phone,
        email,
        address,
        created_by,
        updated_by
      ) values (
        p_first_name,
        p_middle_name,
        p_last_name,
        p_phone,
        p_email,
        p_address,
        p_created_by,
        p_created_by
      )

      returning staffs.id as staff_id, staffs.first_name, staffs.middle_name, staffs.last_name, staffs.phone, staffs.email, staffs.address;
  else
    update staffs
    set
      first_name        = p_first_name,
      middle_name       = p_middle_name,
      last_name         = p_last_name,
      phone             = p_phone,
      email             = p_email,
      address           = p_address,
      updated_by        = p_created_by
    where
      staffs.id         = p_staff_id;

    return query
      select
        staffs.id as staff_id,
        staffs.first_name,
        staffs.middle_name,
        staffs.last_name,
        staffs.phone,
        staffs.email,
        staffs.address
      from staffs
      where staffs.id = p_staff_id;
  end if;
end;
$$;


ALTER FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_branch_id" "uuid", "p_created_by" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_staff_branches"("p_staff_id" "uuid", "p_branch_id" "uuid", "p_created_by" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO staff_branches (
    staff_id,
    branch_id,
    created_by,
    updated_by
  ) VALUES (
    p_staff_id,
    p_branch_id,
    p_created_by,
    p_created_by
  )
  ON CONFLICT (staff_id, branch_id)
  DO UPDATE SET
    updated_by = EXCLUDED.p_created_by,
    updated_at = NOW();
END;
$$;


ALTER FUNCTION "public"."upsert_staff_branches"("p_staff_id" "uuid", "p_branch_id" "uuid", "p_created_by" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_stocks"("p_stock_id" "uuid", "p_name" "text", "p_quantity" integer, "p_created_by" "uuid") RETURNS TABLE("stock_id" "uuid")
    LANGUAGE "plpgsql"
    AS $$
declare
  stock_id uuid;
begin
  if p_stock_id is null then
     insert into stocks (
      name,
      quantity,
      created_by,
      updated_by
    ) values (
      p_name,
      p_quantity,
      p_created_by,
      p_created_by
    )
    returning stocks.id into stock_id;
  else
    update stocks
    set
      name = p_name,
      quantity = p_quantity,
      updated_by = p_created_by,
      updated_at = now()
    where stocks.id = p_stock_id;

    stock_id := p_stock_id;
  end if;
  return query select stock_id;
end;
$$;


ALTER FUNCTION "public"."upsert_stocks"("p_stock_id" "uuid", "p_name" "text", "p_quantity" integer, "p_created_by" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."branch_stocks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "stock_id" "uuid" NOT NULL,
    "branch_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_by" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text")
);


ALTER TABLE "public"."branch_stocks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."branches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "address" "text" NOT NULL,
    "branch_stocks" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."branches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "customer_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" "text" NOT NULL,
    "middle_name" "text",
    "last_name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "email" "text",
    "address" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid"
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "price" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "branch_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_by" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text")
);


ALTER TABLE "public"."inventory" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."order_number_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."order_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "order_id" "text" NOT NULL,
    "customer_id" "uuid",
    "branch_id" "uuid",
    "items" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "order_status" "text" DEFAULT 'Pending'::"text" NOT NULL,
    "payment_status" "text" DEFAULT 'Unpaid'::"text" NOT NULL,
    "order_date" timestamp with time zone DEFAULT "now"(),
    "total_price" numeric DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "orders_order_status_check" CHECK (("order_status" = ANY (ARRAY['Pending'::"text", 'Ongoing'::"text", 'Ready for Pickup'::"text", 'Picked up'::"text", 'Cancelled'::"text"]))),
    CONSTRAINT "orders_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['Paid'::"text", 'Unpaid'::"text", 'Refunded'::"text"]))),
    CONSTRAINT "orders_total_price_check" CHECK (("total_price" >= (0)::numeric))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promo_branches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "promo_id" "uuid" NOT NULL,
    "branch_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_by" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text")
);


ALTER TABLE "public"."promo_branches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "description" "text",
    "valid_until" "date" NOT NULL,
    "status" "text" DEFAULT 'Active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "promos_status_check" CHECK (("status" = ANY (ARRAY['Active'::"text", 'Inactive'::"text", 'Expired'::"text"])))
);


ALTER TABLE "public"."promos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_by" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text")
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sales" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "text" NOT NULL,
    "status" "public"."payment_status_enum" DEFAULT 'Unpaid'::"public"."payment_status_enum",
    "total_price" integer,
    "branch_id" "uuid" NOT NULL,
    "items" "jsonb"[] DEFAULT ARRAY[]::"jsonb"[],
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_by" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text")
);


ALTER TABLE "public"."sales" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "price" numeric NOT NULL,
    "status" "text" DEFAULT 'Active'::"text" NOT NULL,
    "branch_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "services_price_check" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "services_status_check" CHECK (("status" = ANY (ARRAY['Active'::"text", 'Inactive'::"text"])))
);


ALTER TABLE "public"."services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."staff_branches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "staff_id" "uuid",
    "branch_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_by" "uuid",
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."staff_branches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."staffs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" "text" NOT NULL,
    "middle_name" "text",
    "last_name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "email" "text",
    "address" "text" NOT NULL,
    "employment_date" "date" NOT NULL,
    "branch_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."staffs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stocks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "quantity" integer,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text"),
    "updated_by" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text")
);


ALTER TABLE "public"."stocks" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_branches" AS
 SELECT "branches"."id",
    "branches"."name",
    "branches"."description",
    "branches"."address",
    "branches"."branch_stocks",
    "branches"."created_at",
    "branches"."updated_at",
    "branches"."created_by",
    "branches"."updated_by"
   FROM "public"."branches";


ALTER TABLE "public"."view_branches" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_customers" AS
 SELECT "customers"."customer_id",
    "customers"."first_name",
    "customers"."middle_name",
    "customers"."last_name",
    "concat"("customers"."first_name", ' ', COALESCE(("customers"."middle_name" || ' '::"text"), ''::"text"), "customers"."last_name") AS "full_name",
    "customers"."phone",
    "customers"."email",
    "customers"."address",
    "customers"."created_at",
    "customers"."updated_at",
    "customers"."created_by",
    "customers"."updated_by"
   FROM "public"."customers";


ALTER TABLE "public"."view_customers" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_orders" AS
 SELECT "o"."order_id",
    "o"."customer_id",
    "o"."branch_id",
    "concat"("c"."first_name", ' ', COALESCE(("c"."middle_name" || ' '::"text"), ''::"text"), "c"."last_name") AS "customer_name",
    "b"."name" AS "branch_name",
    "o"."items",
    "o"."order_status",
    "o"."payment_status",
    "o"."order_date",
    "o"."total_price",
    "o"."created_at",
    "o"."updated_at",
    "o"."created_by",
    "o"."updated_by"
   FROM (("public"."orders" "o"
     LEFT JOIN "public"."customers" "c" ON (("o"."customer_id" = "c"."customer_id")))
     LEFT JOIN "public"."branches" "b" ON (("o"."branch_id" = "b"."id")));


ALTER TABLE "public"."view_orders" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_services" AS
 SELECT "s"."id",
    "s"."name",
    "s"."price",
    "s"."status",
    "s"."branch_id",
    "b"."name" AS "branch_name",
    "s"."created_at",
    "s"."updated_at",
    "s"."created_by",
    "s"."updated_by"
   FROM ("public"."services" "s"
     LEFT JOIN "public"."branches" "b" ON (("s"."branch_id" = "b"."id")));


ALTER TABLE "public"."view_services" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_staffs" AS
 SELECT "s"."id",
    "s"."first_name",
    "s"."middle_name",
    "s"."last_name",
    "concat"("s"."first_name", ' ', COALESCE(("s"."middle_name" || ' '::"text"), ''::"text"), "s"."last_name") AS "full_name",
    "s"."phone",
    "s"."email",
    "s"."address",
    "s"."employment_date",
    "s"."branch_id",
    "b"."name" AS "branch_name",
    "s"."created_at",
    "s"."updated_at",
    "s"."created_by"
   FROM ("public"."staffs" "s"
     LEFT JOIN "public"."branches" "b" ON (("s"."branch_id" = "b"."id")));


ALTER TABLE "public"."view_staffs" OWNER TO "postgres";


ALTER TABLE ONLY "public"."branch_stocks"
    ADD CONSTRAINT "branch_stocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."branch_stocks"
    ADD CONSTRAINT "branch_stocks_stock_id_branch_id_unique_key" UNIQUE ("stock_id", "branch_id");



ALTER TABLE ONLY "public"."branches"
    ADD CONSTRAINT "branches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("customer_id");



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id");



ALTER TABLE ONLY "public"."promo_branches"
    ADD CONSTRAINT "promo_branches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promo_branches"
    ADD CONSTRAINT "promo_branches_promo_id_branch_id_unique_key" UNIQUE ("promo_id", "branch_id");



ALTER TABLE ONLY "public"."promos"
    ADD CONSTRAINT "promos_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."promos"
    ADD CONSTRAINT "promos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_order_id_branch_id_unique_key" UNIQUE ("order_id", "branch_id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_branches"
    ADD CONSTRAINT "staff_branches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staff_branches"
    ADD CONSTRAINT "staff_branches_staff_id_branch_id_unqiue" UNIQUE ("staff_id", "branch_id");



ALTER TABLE ONLY "public"."staffs"
    ADD CONSTRAINT "staffs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stocks"
    ADD CONSTRAINT "stocks_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_branches_created_at" ON "public"."branches" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_branches_name" ON "public"."branches" USING "btree" ("name");



CREATE INDEX "idx_customers_created_at" ON "public"."customers" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_customers_email" ON "public"."customers" USING "btree" ("email");



CREATE INDEX "idx_customers_name" ON "public"."customers" USING "btree" ("first_name", "last_name");



CREATE INDEX "idx_customers_phone" ON "public"."customers" USING "btree" ("phone");



CREATE INDEX "idx_orders_branch_id" ON "public"."orders" USING "btree" ("branch_id");



CREATE INDEX "idx_orders_customer_id" ON "public"."orders" USING "btree" ("customer_id");



CREATE INDEX "idx_orders_date" ON "public"."orders" USING "btree" ("order_date" DESC);



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("order_status", "payment_status");



CREATE INDEX "idx_orders_total_price" ON "public"."orders" USING "btree" ("total_price");



CREATE INDEX "idx_promos_code" ON "public"."promos" USING "btree" ("code");



CREATE INDEX "idx_promos_status" ON "public"."promos" USING "btree" ("status");



CREATE INDEX "idx_promos_valid_until" ON "public"."promos" USING "btree" ("valid_until");



CREATE INDEX "idx_services_branch_id" ON "public"."services" USING "btree" ("branch_id");



CREATE INDEX "idx_services_price" ON "public"."services" USING "btree" ("price");



CREATE INDEX "idx_services_status" ON "public"."services" USING "btree" ("status");



CREATE INDEX "idx_staffs_branch_id" ON "public"."staffs" USING "btree" ("branch_id");



CREATE INDEX "idx_staffs_employment_date" ON "public"."staffs" USING "btree" ("employment_date");



ALTER TABLE ONLY "public"."branch_stocks"
    ADD CONSTRAINT "branch_stocks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."branch_stocks"
    ADD CONSTRAINT "branch_stocks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."inventory"
    ADD CONSTRAINT "inventory_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("customer_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."promo_branches"
    ADD CONSTRAINT "promo_branches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."promo_branches"
    ADD CONSTRAINT "promo_branches_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."services"
    ADD CONSTRAINT "services_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."staff_branches"
    ADD CONSTRAINT "staff_branches_created_by" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."staff_branches"
    ADD CONSTRAINT "staff_branches_updated_by" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."staffs"
    ADD CONSTRAINT "staffs_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stocks"
    ADD CONSTRAINT "stocks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."stocks"
    ADD CONSTRAINT "stocks_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



CREATE POLICY "Allow all for authenticated users" ON "public"."branches" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow all for authenticated users" ON "public"."customers" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow all for authenticated users" ON "public"."orders" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow all for authenticated users" ON "public"."promos" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow all for authenticated users" ON "public"."services" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow all for authenticated users" ON "public"."staffs" USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."branches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."services" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staffs" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."add_customer_order"("p_branch_id" "uuid", "p_customer_id" "uuid", "p_order_status" "public"."order_status_enum", "p_order_date" timestamp without time zone, "p_payment_status" "public"."payment_status_enum", "p_total_price" integer, "p_items" "jsonb"[], "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."add_customer_order"("p_branch_id" "uuid", "p_customer_id" "uuid", "p_order_status" "public"."order_status_enum", "p_order_date" timestamp without time zone, "p_payment_status" "public"."payment_status_enum", "p_total_price" integer, "p_items" "jsonb"[], "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_customer_order"("p_branch_id" "uuid", "p_customer_id" "uuid", "p_order_status" "public"."order_status_enum", "p_order_date" timestamp without time zone, "p_payment_status" "public"."payment_status_enum", "p_total_price" integer, "p_items" "jsonb"[], "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_orders"("p_branch_id" "uuid", "p_customer_id" "uuid", "p_status" "public"."order_status_enum", "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."add_orders"("p_branch_id" "uuid", "p_customer_id" "uuid", "p_status" "public"."order_status_enum", "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_orders"("p_branch_id" "uuid", "p_customer_id" "uuid", "p_status" "public"."order_status_enum", "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_sales"("p_order_id" "text", "p_branch_id" "uuid", "p_total_price" integer, "p_items" "jsonb"[], "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."add_sales"("p_order_id" "text", "p_branch_id" "uuid", "p_total_price" integer, "p_items" "jsonb"[], "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_sales"("p_order_id" "text", "p_branch_id" "uuid", "p_total_price" integer, "p_items" "jsonb"[], "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_next_order_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_next_order_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_next_order_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_summary"("p_customer_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_summary"("p_customer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_summary"("p_customer_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_low_stock_items"("p_threshold" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_low_stock_items"("p_threshold" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_low_stock_items"("p_threshold" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_order_stats"("p_start_date" "date", "p_end_date" "date", "p_branch_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_order_stats"("p_start_date" "date", "p_end_date" "date", "p_branch_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_order_stats"("p_start_date" "date", "p_end_date" "date", "p_branch_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_recent_orders"("p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_recent_orders"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_recent_orders"("p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_service_popularity"("p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_service_popularity"("p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_service_popularity"("p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."search_customers_basic"("p_search_term" "text", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_customers_basic"("p_search_term" "text", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_customers_basic"("p_search_term" "text", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_order_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_order_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_order_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_order_status"("p_order_id" "text", "p_order_status" "public"."order_status_enum", "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_order_status"("p_order_id" "text", "p_order_status" "public"."order_status_enum", "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_order_status"("p_order_id" "text", "p_order_status" "public"."order_status_enum", "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_payment_status"("p_order_id" "text", "p_payment_status" "public"."payment_status_enum", "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_payment_status"("p_order_id" "text", "p_payment_status" "public"."payment_status_enum", "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_payment_status"("p_order_id" "text", "p_payment_status" "public"."payment_status_enum", "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_sales_status"("p_order_id" "uuid", "p_status" "public"."payment_status_enum", "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_sales_status"("p_order_id" "uuid", "p_status" "public"."payment_status_enum", "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_sales_status"("p_order_id" "uuid", "p_status" "public"."payment_status_enum", "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_branch"("p_branch_id" "uuid", "p_name" "text", "p_description" "text", "p_address" "text", "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_branch"("p_branch_id" "uuid", "p_name" "text", "p_description" "text", "p_address" "text", "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_branch"("p_branch_id" "uuid", "p_name" "text", "p_description" "text", "p_address" "text", "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_branch_stocks"("p_stock_id" "uuid", "p_name" "text", "p_quantity" integer, "p_branch_id" "uuid", "p_created_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_branch_stocks"("p_stock_id" "uuid", "p_name" "text", "p_quantity" integer, "p_branch_id" "uuid", "p_created_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_branch_stocks"("p_stock_id" "uuid", "p_name" "text", "p_quantity" integer, "p_branch_id" "uuid", "p_created_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_customer"("p_customer_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_customer"("p_customer_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_customer"("p_customer_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_promo"("p_promo_id" "uuid", "p_name" "text", "p_code" "text", "p_description" "text", "p_valid_until" timestamp without time zone, "p_status" "public"."promo_status_enum", "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_promo"("p_promo_id" "uuid", "p_name" "text", "p_code" "text", "p_description" "text", "p_valid_until" timestamp without time zone, "p_status" "public"."promo_status_enum", "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_promo"("p_promo_id" "uuid", "p_name" "text", "p_code" "text", "p_description" "text", "p_valid_until" timestamp without time zone, "p_status" "public"."promo_status_enum", "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_promo"("p_promo_id" "uuid", "p_name" "text", "p_code" "text", "p_description" "text", "p_valid_until" timestamp without time zone, "p_status" "public"."promo_status_enum", "p_branches" "uuid"[], "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_promo"("p_promo_id" "uuid", "p_name" "text", "p_code" "text", "p_description" "text", "p_valid_until" timestamp without time zone, "p_status" "public"."promo_status_enum", "p_branches" "uuid"[], "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_promo"("p_promo_id" "uuid", "p_name" "text", "p_code" "text", "p_description" "text", "p_valid_until" timestamp without time zone, "p_status" "public"."promo_status_enum", "p_branches" "uuid"[], "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_promo_branch"("p_promo_id" "uuid", "p_branch_id" "uuid", "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_promo_branch"("p_promo_id" "uuid", "p_branch_id" "uuid", "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_promo_branch"("p_promo_id" "uuid", "p_branch_id" "uuid", "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_sales"("p_order_id" "uuid", "p_branch_id" "uuid", "p_status" "public"."payment_status_enum", "p_price" "text", "p_items" "jsonb"[], "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_sales"("p_order_id" "uuid", "p_branch_id" "uuid", "p_status" "public"."payment_status_enum", "p_price" "text", "p_items" "jsonb"[], "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_sales"("p_order_id" "uuid", "p_branch_id" "uuid", "p_status" "public"."payment_status_enum", "p_price" "text", "p_items" "jsonb"[], "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_service"("p_service_id" "uuid", "p_branch_id" "uuid", "p_name" "text", "p_price" integer, "p_status" "public"."service_status_enum", "p_staff_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_service"("p_service_id" "uuid", "p_branch_id" "uuid", "p_name" "text", "p_price" integer, "p_status" "public"."service_status_enum", "p_staff_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_service"("p_service_id" "uuid", "p_branch_id" "uuid", "p_name" "text", "p_price" integer, "p_status" "public"."service_status_enum", "p_staff_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_branch_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_branch_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_branch_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_employment_date" "text", "p_created_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_employment_date" "text", "p_created_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_employment_date" "text", "p_created_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_branch_id" "uuid", "p_created_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_branch_id" "uuid", "p_created_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_staff"("p_staff_id" "uuid", "p_first_name" "text", "p_middle_name" "text", "p_last_name" "text", "p_phone" "text", "p_email" "text", "p_address" "text", "p_branch_id" "uuid", "p_created_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_staff_branches"("p_staff_id" "uuid", "p_branch_id" "uuid", "p_created_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_staff_branches"("p_staff_id" "uuid", "p_branch_id" "uuid", "p_created_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_staff_branches"("p_staff_id" "uuid", "p_branch_id" "uuid", "p_created_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_stocks"("p_stock_id" "uuid", "p_name" "text", "p_quantity" integer, "p_created_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_stocks"("p_stock_id" "uuid", "p_name" "text", "p_quantity" integer, "p_created_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_stocks"("p_stock_id" "uuid", "p_name" "text", "p_quantity" integer, "p_created_by" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."branch_stocks" TO "anon";
GRANT ALL ON TABLE "public"."branch_stocks" TO "authenticated";
GRANT ALL ON TABLE "public"."branch_stocks" TO "service_role";



GRANT ALL ON TABLE "public"."branches" TO "anon";
GRANT ALL ON TABLE "public"."branches" TO "authenticated";
GRANT ALL ON TABLE "public"."branches" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."inventory" TO "anon";
GRANT ALL ON TABLE "public"."inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."promo_branches" TO "anon";
GRANT ALL ON TABLE "public"."promo_branches" TO "authenticated";
GRANT ALL ON TABLE "public"."promo_branches" TO "service_role";



GRANT ALL ON TABLE "public"."promos" TO "anon";
GRANT ALL ON TABLE "public"."promos" TO "authenticated";
GRANT ALL ON TABLE "public"."promos" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."sales" TO "anon";
GRANT ALL ON TABLE "public"."sales" TO "authenticated";
GRANT ALL ON TABLE "public"."sales" TO "service_role";



GRANT ALL ON TABLE "public"."services" TO "anon";
GRANT ALL ON TABLE "public"."services" TO "authenticated";
GRANT ALL ON TABLE "public"."services" TO "service_role";



GRANT ALL ON TABLE "public"."staff_branches" TO "anon";
GRANT ALL ON TABLE "public"."staff_branches" TO "authenticated";
GRANT ALL ON TABLE "public"."staff_branches" TO "service_role";



GRANT ALL ON TABLE "public"."staffs" TO "anon";
GRANT ALL ON TABLE "public"."staffs" TO "authenticated";
GRANT ALL ON TABLE "public"."staffs" TO "service_role";



GRANT ALL ON TABLE "public"."stocks" TO "anon";
GRANT ALL ON TABLE "public"."stocks" TO "authenticated";
GRANT ALL ON TABLE "public"."stocks" TO "service_role";



GRANT ALL ON TABLE "public"."view_branches" TO "anon";
GRANT ALL ON TABLE "public"."view_branches" TO "authenticated";
GRANT ALL ON TABLE "public"."view_branches" TO "service_role";



GRANT ALL ON TABLE "public"."view_customers" TO "anon";
GRANT ALL ON TABLE "public"."view_customers" TO "authenticated";
GRANT ALL ON TABLE "public"."view_customers" TO "service_role";



GRANT ALL ON TABLE "public"."view_orders" TO "anon";
GRANT ALL ON TABLE "public"."view_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."view_orders" TO "service_role";



GRANT ALL ON TABLE "public"."view_services" TO "anon";
GRANT ALL ON TABLE "public"."view_services" TO "authenticated";
GRANT ALL ON TABLE "public"."view_services" TO "service_role";



GRANT ALL ON TABLE "public"."view_staffs" TO "anon";
GRANT ALL ON TABLE "public"."view_staffs" TO "authenticated";
GRANT ALL ON TABLE "public"."view_staffs" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
