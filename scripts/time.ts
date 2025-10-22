#!/usr/bin/env tsx

import { DateTime } from "luxon";
import { log, note } from "@clack/prompts";

!async function () {
    const timestamp = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ssZZ");
    note(timestamp, `Time is`);
}().catch((error) => {
    // Handle any errors that occur during execution
    log.error("An error occurred:");
    log.error(error);
    process.exit(1);
});
