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
		name: 'Mr. Navin Dhakal',
		role: 'Director',
		profession: 'IB Chemistry Teacher',
		region: 'BC',
		photo: '/team/navin-dhakal.jpg',
		bio: 'Experienced educator and former President bringing scientific rigor, academic leadership, and dedicated public service to CANFACS.'
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
	},
	{ name: 'Dr. Ram Krishna Mahat', role: 'Advisory Board Member' },
	{ name: 'Prof. Dr. Govinda Dahal', role: 'Advisory Board Member' },
	{ name: 'Dr. Tula Datta Paudel', role: 'Advisory Board Member' },
	{ name: 'Dr. Bishwa Adhikari', role: 'Advisory Board Member' },
	{ name: 'Mr. Gopal Bhandari', role: 'Advisory Board Member' }
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
