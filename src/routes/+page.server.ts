import type { PageServerLoad } from './$types';
import { getDb, getTeamLeadership, getLeadershipVersion } from '$lib/server/db';
import { EXECUTIVE_BOARD } from '$lib/data/siteData';

export const load: PageServerLoad = async ({ platform, setHeaders }) => {
	const db = getDb(platform);
	try {
		const { executiveBoard } = await getTeamLeadership(db);
		const version = getLeadershipVersion();

		setHeaders({
			'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
			'etag': `"team-v${version}"`
		});
		return {
			executiveBoard: executiveBoard.length > 0 ? executiveBoard : EXECUTIVE_BOARD
		};
	} catch (e) {
		return {
			executiveBoard: EXECUTIVE_BOARD
		};
	}
};
