-- CANFACS Events Management System
-- Migration 0014: events table and Canada-Nepal Friendship Day 2027

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subtitle TEXT,
    tagline TEXT,
    date_display TEXT NOT NULL,
    event_date TEXT,
    event_time TEXT,
    venue TEXT NOT NULL,
    location TEXT NOT NULL,
    summary TEXT,
    description TEXT NOT NULL,
    highlights TEXT, -- JSON array of strings
    banner_image_url TEXT,
    is_featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'cancelled'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON events(is_featured);

-- Seed Canada-Nepal Friendship Day 2027 Landmark Event
INSERT OR REPLACE INTO events (
    id,
    title,
    slug,
    subtitle,
    tagline,
    date_display,
    event_date,
    event_time,
    venue,
    location,
    summary,
    description,
    highlights,
    banner_image_url,
    is_featured,
    status,
    created_at,
    updated_at
) VALUES (
    'canada-nepal-friendship-day-2027',
    'Canada–Nepal Friendship Day 2027',
    'canada-nepal-friendship-day-2027',
    'Unity in Diversity',
    'Celebrating 61 Years of Diplomatic Relations',
    'Saturday, January 23, 2027 | 4:00 PM – 8:00 PM',
    '2027-01-23',
    '4:00 PM – 8:00 PM',
    'Centre Stage, City Hall, Surrey BC',
    'Centre Stage, City Hall, Surrey BC',
    'Join CANFACS for Canada–Nepal Friendship Day 2027 at Surrey City Hall Centre Stage, celebrating 61 years of diplomatic relations with First Nations cultural exchange, vibrant Nepali folk performances, youth keynotes, and multicultural showcases.',
    'The Canada-Nepal Friendship & Cultural Society (CANFACS) proudly presents Canada–Nepal Friendship Day 2027 under the theme "Unity in Diversity", commemorating 61 illustrious years of official diplomatic relations between Canada and Nepal. Hosted at the prestigious Centre Stage at Surrey City Hall, this landmark community celebration unites Indigenous First Nations leaders, the Nepalese diaspora, youth changemakers, civic dignitaries, and diverse cultural communities across British Columbia and Canada. Our diversity is our greatest collective strength. All are welcome!',
    '["First Nations Welcome Dance & Land Acknowledgement","Vibrant Nepali Folk Performances & Cross-Cultural Arts","Youth Keynotes: Climate Resilience & Ethical AI","Multicultural Showcase & Civic Partnerships"]',
    '/events/canada-nepal-friendship-day-2027.jpg',
    1,
    'upcoming',
    '2026-11-11T13:30:00.000Z',
    '2026-11-11T13:30:00.000Z'
);

-- Seed Everest Day
INSERT OR IGNORE INTO events (
    id,
    title,
    slug,
    subtitle,
    tagline,
    date_display,
    event_date,
    event_time,
    venue,
    location,
    summary,
    description,
    highlights,
    banner_image_url,
    is_featured,
    status,
    created_at,
    updated_at
) VALUES (
    'everest-day-2025',
    'International Mount Everest Day Celebration',
    'everest-day-2025',
    'Mountaineering Heritage & Environmental Conservation',
    'Honoring Sir Edmund Hillary and Tenzing Norgay Sherpa',
    'May 29, 2025',
    '2025-05-29',
    'All Day',
    'Greater Vancouver & Online',
    'Greater Vancouver & Online',
    'Commemorating the historical first ascent of Mt. Everest by Sir Edmund Hillary and Tenzing Norgay Sherpa.',
    'Commemorating the historical first ascent of Mt. Everest by Sir Edmund Hillary and Tenzing Norgay Sherpa on May 29, 1953, honoring mountaineering achievements and Nepalese heritage.',
    '["Mountaineering slideshows & documentary screenings","Environmental conservation forum","Cultural exchange assembly"]',
    '/pptx-gallery/image28.jpg',
    0,
    'completed',
    '2025-05-01T00:00:00.000Z',
    '2025-05-01T00:00:00.000Z'
);

-- Seed Bhetghat Festival
INSERT OR IGNORE INTO events (
    id,
    title,
    slug,
    subtitle,
    tagline,
    date_display,
    event_date,
    event_time,
    venue,
    location,
    summary,
    description,
    highlights,
    banner_image_url,
    is_featured,
    status,
    created_at,
    updated_at
) VALUES (
    'bhetghat-2025',
    'Annual Bhetghat & Cultural Festival',
    'bhetghat-2025',
    'Community Gathering & Cultural Heritage',
    'Celebrating Nepali Traditions Across Canada',
    'Autumn 2025',
    '2025-10-15',
    '5:00 PM – 9:00 PM',
    'Surrey, BC',
    'Surrey, BC',
    'A vibrant community gathering featuring traditional Nepali cuisine, folk music, authentic dance performances, and community networking.',
    'A vibrant community gathering featuring traditional Nepali cuisine, folk music, authentic dance performances, and community networking.',
    '["Traditional Nepali cuisine & tea","Authentic folk music and dance","Community networking and honors"]',
    '/bhetghat-festival.png',
    0,
    'completed',
    '2025-09-01T00:00:00.000Z',
    '2025-09-01T00:00:00.000Z'
);
