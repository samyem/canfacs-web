export interface TeamMember {
	name: string;
	role: string;
	profession?: string;
	bio?: string;
	photo?: string;
	region?: string;
	subname?: string;
	credentials?: string;
}

export interface NewsItem {
	id: string;
	title: string;
	date: string;
	summary: string;
	link?: string;
}

export interface EventItem {
	id: string;
	title: string;
	date: string;
	location: string;
	description: string;
}

export interface ImpactActivity {
	id: string;
	title: string;
	category: string;
	summary: string;
	details: string[];
	icon: string;
	tags: string[];
	beneficiaries?: string;
}

export const SITE_INFO = {
	name: 'CANFACS',
	fullName: 'Canada-Nepal Friendship and Cultural Society',
	registeredDate: 'November 30, 2016',
	act: 'Canada Non-Profit Societies Framework',
	diplomaticRelYear: '1965',
	cooperationYear: '1968',
	tagline: 'Bridging Nations, Celebrating Cultures & Strengthening Communities Across Canada',
	missionSummary:
		'A nationwide non-profit organization fostering rich cultural exchange, bilateral partnership, educational initiatives, and community harmony between Canada and Nepal across all provinces and territories.'
};

export const EXECUTIVE_BOARD: TeamMember[] = [
	{
		name: 'Dr. Meghraj Gnawali',
		role: 'President',
		profession: 'Pediatrician',
		region: 'BC',
		photo: '/team/meghraj-gnawali.jpg',
		bio: 'Renowned medical doctor and pediatrician serving as President of CANFACS, advocating for child health initiatives, medical relief, cultural heritage, and community wellness nationwide.'
	},
	{
		name: 'Ms. Bina Shrestha',
		role: 'Vice President',
		profession: 'History / ECE Teacher',
		region: 'BC',
		photo: '/team/bina-shrestha.jpg',
		bio: 'Passionate educator with extensive background in history and early childhood education, preserving cultural heritage and empowering young learners.'
	},
	{
		name: 'Mr. Prem Devkota',
		role: 'Vice President',
		profession: 'Engineer (BC Hydro)',
		region: 'BC',
		photo: '/team/prem-devkota.jpg',
		bio: 'Professional engineer at BC Hydro leading energy infrastructure initiatives and supporting bilateral technical & educational exchanges.'
	},
	{
		name: 'Mr. Rudra Adhikari',
		role: 'Secretary-General',
		profession: 'Financial Analyst',
		region: 'NB',
		photo: '/team/rudra-adhikari.jpg',
		bio: 'Senior financial analyst providing strategic corporate governance, organizational compliance, and financial stewardship across Atlantic Canada.'
	},
	{
		name: 'Mr. Samyem Tuladhar',
		role: 'Director of Communications',
		profession: 'Software Architect',
		region: 'ON',
		photo: '/team/samyem-tuladhar.jpg',
		bio: 'Technology leader and software architect driving digital transformation, web platforms, and public outreach across Ontario and nationwide.'
	},
	{
		name: 'Mr. Kiroj Shrestha',
		role: 'Director',
		profession: 'Design Engineer (Toronto Transit)',
		region: 'ON',
		photo: '/team/kiroj-shrestha.jpg',
		bio: 'Transportation design engineer with Toronto Transit, dedicated to civic infrastructure, youth engagement, and community building.'
	},
	{
		name: 'Mr. Debraj Dhakal',
		role: 'Treasurer',
		profession: 'Chartered Accountant',
		region: 'BC',
		photo: '/team/debraj-dhakal.jpg',
		bio: 'Certified accounting professional managing CANFACS financial planning, annual auditing, non-profit tax filings, and fiscal integrity.'
	},
	{
		name: 'Mr. Purushottam Thapa',
		role: 'Director',
		profession: 'Financial Advisor',
		region: 'BC',
		photo: '/team/purushottam-thapa.jpg',
		bio: 'Financial advisory specialist helping families and newcomers navigate financial planning, investments, and community integration.'
	},
	{
		name: 'Mr. Prakash V Joshi',
		role: 'Director',
		profession: 'Material Engineering Technologist',
		region: 'BC',
		photo: '/team/prakash-v-joshi.jpg',
		bio: 'Engineering technologist focusing on material testing, quality control, and strengthening professional networks for immigrant engineers.'
	},
	{
		name: 'Mr. Hemanta Joshi',
		role: 'Director',
		profession: 'Community Advocate',
		region: 'AB',
		bio: 'Dedicated community leader based in Edmonton, Alberta, advocating for newcomer support, Prairie integration, and bilateral partnerships.'
	},
	{
		name: 'Mr. Bal Sharma',
		role: 'Director',
		profession: 'Community Leader',
		region: 'Canada',
		bio: 'Active community representative and Board Member contributing to cultural promotion, member engagement, and nationwide outreach.'
	}
];

export const ADVISORY_BOARD: TeamMember[] = [
	{
		name: 'Mr. Mackenzie Ami Gospodin',
		subname: '(Er. Mankajee Shrestha)',
		credentials: 'P.Eng., M.Eng. ABA, SEMACP',
		role: 'Founder President of CANFACS',
		photo: '/team/mackenzie-gospodin.jpg'
	},
	{
		name: 'Dr. Drona Prakash Rasali',
		credentials: 'BVSc, PGT, MS, PhD, FACE, DSFV',
		role: 'Founder Vice President of CANFACS',
		photo: '/team/drona-rasali.jpg'
	},
	{
		name: 'Mr. Navin Dhakal',
		role: 'Founding Secretary General of CANFACS',
		profession: 'IB Chemistry Teacher',
		region: 'BC',
		photo: '/team/navin-dhakal.jpg',
		bio: 'Experienced educator bringing scientific rigor, academic leadership, and dedicated public service to CANFACS.'
	},
	{
		name: 'Claude A. Charette',
		profession: 'Fonctionnaire chez Govt.',
		role: 'Past President of CANFACS',
		photo: '/team/claude-charette.jpg'
	},
	{
		name: 'Hon. Randeep Sarai',
		profession: 'Member of Parliament (MP)',
		region: 'Surrey Centre, BC',
		role: 'Advisory Board Member',
		photo: '/team/randeep-sarai.jpg'
	},
	{
		name: 'Hon. Chris Considine',
		credentials: '(K.C.) Lawyer',
		role: 'Honorable Consul General of Nepal',
		photo: '/team/chris-considine.jpg'
	},
	{
		name: 'Dr. William Osei',
		profession: 'Osei Global Health Incorporated',
		credentials: 'MD, MPH FACE',
		role: 'Advisory Board Member',
		photo: '/team/william-osei.jpg'
	}
];

export const PURPOSES = [
	{
		title: 'Government & NGO Partnerships',
		desc: 'Encourage partnerships and collaborations with Government agencies and non-government organizations in Canada and Nepal to fulfill the Society’s goals.'
	},
	{
		title: 'Bilateral Understanding & Goodwill',
		desc: 'Promote, facilitate, and enhance goodwill, mutual understanding, and friendship between the peoples and governments of Canada and Nepal.'
	},
	{
		title: 'Friendship & Cultural Promotion',
		desc: 'Promote friendship, exchange cultural experiences, and support educational programs between Canada and Nepal.'
	},
	{
		title: 'Community Integration & Harmony',
		desc: 'Aid and support Nepali immigrants and visitors in integrating into Canadian society while encouraging multicultural harmony across Canada.'
	},
	{
		title: 'Philanthropic & Humanitarian Support',
		desc: 'Organize humanitarian assistance, medical relief, and educational scholarships for underprivileged communities.'
	}
];

export const EVENTS: EventItem[] = [
	{
		id: 'everest-day-2025',
		title: 'International Mount Everest Day Celebration',
		date: 'May 29, 2025',
		location: 'Greater Vancouver & Online',
		description: 'Commemorating the historical first ascent of Mt. Everest by Sir Edmund Hillary and Tenzing Norgay Sherpa, honoring mountaineering achievements and Nepalese heritage.'
	},
	{
		id: 'bhetghat-2025',
		title: 'Annual Bhetghat & Cultural Festival',
		date: 'Autumn 2025',
		location: 'Surrey, BC',
		description: 'A vibrant community gathering featuring traditional Nepali cuisine, folk music, authentic dance performances, and community networking.'
	}
];

export const NEWSLETTERS = [
	{
		title: 'CANFACS Souvenir 2025',
		year: '2025',
		status: 'Upcoming Release',
		editorial: 'Editor-in-Chief: Gospodin, MK | Tech Consultant: Samyem R. Tuladhar'
	},
	{
		title: 'Newsline 2022',
		year: '2022',
		highlight: 'Surrey Community Leader Award for Founding President Mr. Mankajee Shrestha'
	},
	{
		title: 'Newsletter 2020',
		year: '2020',
		highlight: 'Multicultural Art Interaction Festival, Mha Puja greetings & bilateral essays'
	}
];

export const LOCAL_IMPACT_ACTIVITIES: ImpactActivity[] = [
	{
		id: 'settlement-integration',
		title: 'Newcomer Settlement & Professional Licensure Support',
		category: 'Community & Career Integration',
		summary:
			'Guiding newly arrived Nepali immigrants, skilled professionals, and international students in settling into Canadian life, navigating provincial accreditation, and securing career pathways.',
		details: [
			'Professional licensing guidance for Nepali engineers (EGBC, PEO, APEGA), healthcare professionals, and accountants (CPA Canada).',
			'Mentorship pairings connecting newcomers with established professionals across Canadian industries.',
			'Settlement orientations regarding Canadian housing, school registration, healthcare cards, and community resources.'
		],
		icon: '🧭',
		tags: ['Settlement', 'Career Mentorship', 'Licensing', 'Newcomers'],
		beneficiaries: 'New immigrants, international students, and skilled professionals across Canada'
	},
	{
		id: 'cultural-heritage',
		title: 'Cultural Heritage Preservation & Multigenerational Festivals',
		category: 'Arts, Culture & Heritage',
		summary:
			'Celebrating authentic Nepali traditions, language, art, music, and culinary heritage to maintain strong cultural roots among second-generation youth and share Nepal’s heritage with diverse Canadian communities.',
		details: [
			'Annual Bhetghat gatherings, Dashain-Tihar cultural celebrations, and Mha Puja (Nepal Sambat) festivities.',
			'Nepali language preservation workshops and traditional music & dance demonstrations for children and youth.',
			'Art and folk literature interaction festivals showcasing Nepali-Canadian artisans, writers, and cultural practitioners.'
		],
		icon: '🎨',
		tags: ['Culture', 'Language', 'Festivals', 'Youth', 'Multiculturalism'],
		beneficiaries: 'Nepali-Canadian families, children, and multicultural communities'
	},
	{
		id: 'everest-day-diplomacy',
		title: 'Mount Everest Day & Bilateral Civic Recognition',
		category: 'Civic Pride & Public Outreach',
		summary:
			'Hosting the annual International Mount Everest Day (May 29) across Canadian cities to celebrate mountaineering excellence, Sherpa courage, and Himalayan environmental awareness.',
		details: [
			'Public symposiums, documentary screenings, and keynote dialogues featuring renowned mountaineers and climate scientists.',
			'Official proclamations and engagements with Canadian municipal, provincial, and federal leaders.',
			'Promoting intercultural awareness and recognition of Nepal’s natural and human wonders among Canadian society.'
		],
		icon: '🏔️',
		tags: ['Everest Day', 'Mountaineering', 'Civic Engagement', 'Diplomacy'],
		beneficiaries: 'Canadian public, outdoor enthusiasts, mountaineering community, and diaspora'
	},
	{
		id: 'health-wellness',
		title: 'Community Health, Pediatric Wellness & Senior Support',
		category: 'Healthcare & Social Wellbeing',
		summary:
			'Promoting community health literacy, preventive wellness, mental health awareness, and elder support led by Nepali-Canadian physicians, pediatricians, and public health experts.',
		details: [
			'Health and wellness awareness webinars on chronic disease management, pediatric health, and nutrition.',
			'Seniors’ social inclusion circles to prevent isolation among visiting and resident elderly family members.',
			'Mental wellness and crisis support networking tailored with cultural sensitivity.'
		],
		icon: '🩺',
		tags: ['Healthcare', 'Pediatrics', 'Mental Health', 'Seniors'],
		beneficiaries: 'Families, seniors, and vulnerable community members'
	},
	{
		id: 'youth-leadership',
		title: 'Youth Leadership, STEM & Academic Empowerment',
		category: 'Youth & Education',
		summary:
			'Equipping the next generation of Nepali-Canadian leaders with academic resources, STEM mentorship, hackathons, and civic leadership opportunities.',
		details: [
			'Academic tutoring and post-secondary guidance for high school students entering Canadian universities and colleges.',
			'STEM workshops, software engineering mentorship, and emerging technology discussion forums.',
			'Youth volunteer boards encouraging civic leadership and community service hours.'
		],
		icon: '🚀',
		tags: ['Youth', 'STEM', 'Education', 'Leadership'],
		beneficiaries: 'High school, undergraduate students, and young professionals'
	},
	{
		id: 'publications-storytelling',
		title: 'Bilingual Publications, Research & Archival History',
		category: 'Knowledge & Media',
		summary:
			'Publishing high-quality community magazines, research souvenirs, and digital newsletters documenting the history, milestones, and contributions of the Nepali diaspora in Canada.',
		details: [
			'Periodic publications including CANFACS Souvenir and Newsline featuring essays, historical archives, and member spotlight interviews.',
			'Digital archives preserving oral histories, diplomatic milestone documents, and community records.',
			'Digital news updates keeping members connected across provinces and territories.'
		],
		icon: '📖',
		tags: ['Publications', 'Souvenirs', 'Digital Media', 'History'],
		beneficiaries: 'Community members, historians, researchers, and global readers'
	}
];

export const NEPAL_FLOOD_RELIEF_CAMPAIGN = {
	id: 'nepal-flood-2024',
	title: 'Nepal Flood Emergency Relief & Rehabilitation Fund',
	subtitle:
		'Supporting flood and landslide-affected families, children, and displaced communities across Kathmandu Valley, Kavre, and Koshi/Bagmati provinces.',
	targetGoalCAD: 10000,
	etransferEmail: 'info@canfacs.org',
	disasterContext: {
		event:
			'In late September, Nepal suffered catastrophic flash floods and landslides triggered by record-breaking monsoon rainfall—the heaviest recorded in the region in over 50 years. Over 250 lives were lost, 4,600+ homes were destroyed, and critical highways, bridges, rural water systems, and schools were devastated.',
		impactStats: [
			{ label: 'Lives Lost', value: '250+' },
			{ label: 'Homes Destroyed', value: '4,600+' },
			{ label: 'Displaced Families', value: '8,000+' },
			{ label: 'Target Goal', value: '$10,000 CAD' }
		],
		affectedRegions:
			'Kathmandu Valley (Bagmati, Bishnumati, Hanumante rivers), Lalitpur, Kavrepalanchok, Sindhuli, Makwanpur, and Koshi Province',
		reliefFocus: [
			'Emergency food rations, clean potable drinking water, and water purification kits to prevent waterborne disease outbreaks.',
			'Temporary waterproof shelter kits, warm blankets, and hygiene care packages for displaced families.',
			'Essential medical supplies, wound care, and pediatric first aid in hard-hit rural municipalities.',
			'School rehabilitation support, replacement textbooks, and classroom restoration for children.'
		]
	}
};

export const GLOBAL_IMPACT_ACTIVITIES: ImpactActivity[] = [
	{
		id: 'humanitarian-disaster-relief',
		title: 'Nepal Flood Emergency Relief & Rehabilitation Fund (Active Campaign)',
		category: 'Humanitarian & Crisis Relief',
		summary:
			'Mobilizing rapid emergency assistance, medical relief, and rebuilding aid for families and children displaced by unprecedented monsoon flooding and landslides in Nepal. Target goal: $10,000 CAD.',
		details: [
			'Dedicated Canadian fundraising campaign targeting $10,000 CAD for verified on-the-ground relief in Kathmandu, Kavre, and rural districts.',
			'Procuring and distributing clean water purification, emergency food parcels, and temporary shelter kits.',
			'Long-term community rehabilitation support for affected rural schools, sanitation systems, and health posts.',
			'Direct Interac e-Transfer contributions available to info@canfacs.org with transparent public donor listings.'
		],
		icon: '🌊',
		tags: ['Nepal Flood Relief', 'Emergency Aid', 'Disaster Response', '$10k Goal', 'Active Fundraiser'],
		beneficiaries: 'Over 8,000 displaced individuals, children, and flood-affected rural communities in Nepal'
	},
	{
		id: 'diplomatic-partnership',
		title: 'Bilateral Diplomatic & Inter-Institutional Cooperation',
		category: 'Diplomacy & Government Relations',
		summary:
			'Strengthening the historic friendship established in 1965 between Canada and Nepal through direct engagement with embassies, consulates, parliamentary bodies, and civil societies.',
		details: [
			'Close partnership with the Embassy of Nepal in Ottawa, the Honorary Consulate of Nepal in BC, and Canadian parliamentary representatives.',
			'Promoting bilateral friendship treaties, educational pacts, and cultural exchange agreements.',
			'Coordinating high-level visits, diplomatic receptions, and bilateral celebration milestones.'
		],
		icon: '🤝',
		tags: ['Diplomacy', 'Embassy Relations', 'Bilateral Ties', 'Policy'],
		beneficiaries: 'Peoples and governments of Canada and Nepal'
	},
	{
		id: 'humanitarian-disaster-relief',
		title: 'Emergency Humanitarian Relief & Disaster Resilience',
		category: 'Humanitarian & Crisis Relief',
		summary:
			'Mobilizing rapid emergency assistance, medical relief, and rebuilding aid for vulnerable communities in Nepal during natural disasters, earthquakes, and humanitarian crises.',
		details: [
			'Fundraising and direct coordination with registered on-the-ground relief teams during earthquakes, landslides, and floods.',
			'Procuring and distributing medical equipment, emergency blankets, winter supplies, and water purification resources.',
			'Long-term community rehabilitation support for schools and health clinics in affected rural districts.'
		],
		icon: '❤️‍🩹',
		tags: ['Humanitarian Relief', 'Disaster Response', 'Medical Aid', 'Emergency Support'],
		beneficiaries: 'Affected rural communities, disaster victims, and remote populations in Nepal'
	},
	{
		id: 'rural-education-scholarships',
		title: 'Rural Education Sponsorships & STEM School Initiatives',
		category: 'Global Education & Literacy',
		summary:
			'Supporting underprivileged children, girls, and rural schools in Nepal through scholarship stipends, educational materials, and school infrastructure improvements.',
		details: [
			'Educational sponsorship programs helping economically disadvantaged students stay in school.',
			'Providing books, computers, science kits, and library infrastructure to remote schools in Nepal.',
			'Teacher training exchanges and digital classroom resource sharing between Canadian and Nepali educators.'
		],
		icon: '🎓',
		tags: ['Scholarships', 'Rural Schools', 'STEM Education', 'Literacy'],
		beneficiaries: 'Underprivileged students and rural schools across Nepal'
	},
	{
		id: 'knowledge-technology-transfer',
		title: 'Clean Energy, Engineering & Technology Transfer',
		category: 'Sustainable Development & Tech',
		summary:
			'Bridging Canadian engineering, clean tech, and public infrastructure know-how with sustainable development needs in Nepal.',
		details: [
			'Bilateral knowledge exchange in hydroelectric power generation, renewable energy systems, and grid reliability.',
			'Sharing civil engineering, seismic safety standards, and sustainable urban transport practices.',
			'Collaborative seminars between Canadian engineering associations and Nepali academic institutions.'
		],
		icon: '⚡',
		tags: ['Renewable Energy', 'Engineering', 'Infrastructure', 'Hydroelectric'],
		beneficiaries: 'Energy engineers, researchers, and sustainable development institutions'
	},
	{
		id: 'himalayan-conservation-ecotourism',
		title: 'Himalayan Eco-Tourism & Climate Conservation Advocacy',
		category: 'Environmental Conservation',
		summary:
			'Promoting responsible tourism, eco-trekking, mountaineering ethics, and raising awareness regarding the vulnerability of Himalayan glaciers to global climate change.',
		details: [
			'Promoting Nepal as an authentic, culturally rich, and eco-friendly travel destination for Canadian travelers.',
			'Himalayan climate change dialogues highlighting glacial melt, water security, and highland ecosystem protection.',
			'Collaborating with indigenous mountain communities and eco-tourism operators for ethical tourism practices.'
		],
		icon: '🌱',
		tags: ['Eco-Tourism', 'Himalayas', 'Climate Change', 'Conservation'],
		beneficiaries: 'Himalayan mountain communities, travelers, and environmental organizations'
	},
	{
		id: 'diaspora-philanthropy',
		title: 'Diaspora Philanthropy & Grassroots Socioeconomic Growth',
		category: 'Community Development',
		summary:
			'Empowering Nepali-Canadians to channel collective philanthropic resources, skills, and micro-investments into high-impact local grassroots projects in Nepal.',
		details: [
			'Facilitating verified grassroots community projects in water sanitation, women’s vocational training, and child health.',
			'Connecting diaspora technical specialists with Nepali community leaders to design sustainable solutions.',
			'Transparent reporting and stewardship ensuring high accountability for every donor dollar.'
		],
		icon: '🌍',
		tags: ['Philanthropy', 'Grassroots', 'Women Empowerment', 'Clean Water'],
		beneficiaries: 'Grassroots communities, women entrepreneurs, and rural villages in Nepal'
	}
];
