import type { PageServerLoad } from './$types';
import { getDb, getTeamLeadership } from '$lib/server/db';
import { EXECUTIVE_BOARD, ADVISORY_BOARD } from '$lib/data/siteData';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);
	try {
		const { executiveBoard, advisoryBoard } = await getTeamLeadership(db);

		return {
			executiveBoard: executiveBoard.length > 0 ? executiveBoard : EXECUTIVE_BOARD,
			advisoryBoard: advisoryBoard.length > 0 ? advisoryBoard : ADVISORY_BOARD
		};
	} catch (error) {
		console.error('Error fetching dynamic team leadership:', error);
		return {
			executiveBoard: EXECUTIVE_BOARD,
			advisoryBoard: ADVISORY_BOARD
		};
	}
};
