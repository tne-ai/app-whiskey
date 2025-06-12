// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = ({ params }: Parameters<PageServerLoad>[0]) => {
    // Redirect to the details page when user navigates to /sites/[siteId]
    throw redirect(307, `/sites/${params.siteId}/details`);
}; 