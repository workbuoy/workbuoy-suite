diff --git a//dev/null b/frontend/src/types/introspection.ts
index 0000000000000000000000000000000000000000..4412532d7185bf99613dab43bb0cd4495809564b 100644
--- a//dev/null
+++ b/frontend/src/types/introspection.ts
@@ -0,0 +1,12 @@
+export type IntrospectionReport = {
+  generatedAt: string;
+  summary: string;
+  signals: Array<{ id: string; status: string; detail: string }>;
+  recommendations: string[];
+};
+
+export type IntrospectionResponse = {
+  ok: boolean;
+  awarenessScore: number;
+  introspectionReport: IntrospectionReport;
+};
