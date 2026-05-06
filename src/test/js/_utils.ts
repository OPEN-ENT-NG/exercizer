import http from "k6/http";
import { group, sleep, check } from "k6";

import {
  getHeaders,
  assertOk,
} from "./node_modules/edifice-k6-commons/dist/index.js";

export function createGrain(title: string, description: string) {
  const headers = getHeaders("application/json");
  const payload = JSON.stringify({
    id: 1127,
    folder_id: null,
    original_subject_id: null,
    owner: "f8aab3ff-7a9f-423e-9e2d-fc65b6398a45",
    owner_username: "teacher K8S cjul",
    created: "2026-03-30T15:52:17.605",
    modified: "2026-03-30T15:52:17.605",
    title: "Titre",
    description: null,
    picture: null,
    max_score: null,
    authors_contributors: null,
    is_library_subject: false,
    is_deleted: false,
    type: "simple",
    version: 1774878737601,
    ingest_job_state: "TO_BE_SENT",
    myRights: {
      manager: {
        right: "fr-openent-exercizer-controllers-SubjectController|remove",
      },
      contrib: {
        right: "fr-openent-exercizer-controllers-SubjectController|canSchedule",
      },
      read: {
        right: "com-thecodingmachine-inca-controllers-ThematicController|list",
      },
    },
  });
  let res = http.post(`${rootUrl}/blog`, payload, { headers });
  assertOk(res, "create blog");
  const blogId = JSON.parse(res.body)["_id"];
  return getBlog(blogId, session);
}
