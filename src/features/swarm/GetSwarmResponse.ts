import SwarmSummaryStatus from "src/types/SwarmSummaryStatus";

export default interface GetSwarmStatusResponse {
  healthy: boolean;
  summary: SwarmSummaryStatus;
}