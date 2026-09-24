/** A team member's count of still-open, non-archived records they own. */
export interface TeamWorkload {
  jobs: number;
  applications: number;
  staffRequests: number;
  enquiries: number;
  total: number;
}
