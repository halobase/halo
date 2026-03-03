export type ReqEnv = { baseUrl: string; apiKey: string | null };

export const SERVICES_URL = [
  {
    name: "tree_potential",
    service: "service:zru08qjthy1u8x6gflkc",
    endpoint: "predict/treevigor",
  },
  {
    name: "phenological_period",
    service: "service:7dlqgjwrt10dnvffuyfk",
    endpoint: "predict/phenology",
  },
  {
    name: "flower_analysis",
    service: "service:ec1wkxtabt9lpgx5gwkr",
    endpoint: "flower_analysis",
  },
  {
    name: "leaf_plum_ratio",
    service: "service:5xnpuw2pkcnvqv5f9uu5",
    endpoint: "leaf_plum_ratio",
  },
] as const;

/** 叶果比分析：仅幼果期、膨大期、采收期时请求 */
export const PHENOLOGICAL_PERIODS_FOR_LEAF_PLUM = ["幼果期", "硬核期", "膨大期", "采收期"];

/** 花量估计：仅初花期、盛花期、谢花期时请求 */
export const PHENOLOGICAL_PERIODS_FOR_FLOWER = ["初花期", "盛花期", "谢花期"];

/** 需要进行三维重建的物候期 */
export const VALID_PERIODS_FOR_RECONSTRUCTION = [
  "休眠期",
  "萌动期",
  "露白期",
  "初花期",
  "盛花期",
  "谢花期",
];
