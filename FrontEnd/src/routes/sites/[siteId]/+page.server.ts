import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
    // Redirect to the details page when user navigates to /sites/[siteId]
    throw redirect(307, `/sites/${params.siteId}/details`);
}; 