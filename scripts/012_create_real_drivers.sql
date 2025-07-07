-- Create real drivers with UUID IDs if they don't exist
INSERT INTO drivers (
    id,
    name,
    phone,
    email,
    status,
    location,
    avatar,
    rating,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    'John Smith',
    '+1-555-0101',
    'john.smith@example.com',
    'available',
    'Los Angeles, CA',
    '/javascript-code.png',
    4.8,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Sarah Johnson',
    '+1-555-0102',
    'sarah.johnson@example.com',
    'available',
    'Phoenix, AZ',
    '/stylized-letters-sj.png',
    4.9,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Mike Williams',
    '+1-555-0103',
    'mike.williams@example.com',
    'on_delivery',
    'San Diego, CA',
    '/intertwined-letters.png',
    4.7,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'Tom Davis',
    '+1-555-0104',
    'tom.davis@example.com',
    'available',
    'Las Vegas, NV',
    '/abstract-geometric-TD.png',
    4.6,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Update any existing drivers without proper UUIDs
UPDATE drivers 
SET id = gen_random_uuid() 
WHERE id IS NULL OR length(id::text) < 36;

-- Ensure we have at least one driver for testing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM drivers LIMIT 1) THEN
        INSERT INTO drivers (
            name,
            phone,
            email,
            status,
            location,
            avatar,
            rating
        ) VALUES (
            'Test Driver',
            '+1-555-0100',
            'test.driver@example.com',
            'available',
            'Test City, TX',
            '/placeholder.svg',
            5.0
        );
    END IF;
END $$;
