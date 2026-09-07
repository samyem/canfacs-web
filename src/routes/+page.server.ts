import type { PageServerLoad } from './$types';
import { getDb, getTeamLeadership } from '$lib/server/db';
import { EXECUTIVE_BOARD } from '$lib/data/siteData';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	try {
		const { executiveBoard } = await getTeamLeadership(db);
		return {
			executiveBoard: executiveBoard.length > 0 ? executiveBoard : EXECUTIVE_BOARD
		};
	} catch (e) {
		return {
			executiveBoard: EXECUTIVE_BOARD
		};
	}
};
