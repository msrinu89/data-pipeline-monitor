import test from "node:test";
import assert from "node:assert/strict";
import { getPipelines, getRuns, referenceTime, duration } from "../src/data.ts";

for (const environment of ["Production", "Staging", "Development"]) {
  test(`${environment}: history and pipeline summaries remain consistent`, () => {
    const pipelines = getPipelines(environment);
    const runs = getRuns(pipelines);
    assert.equal(runs.length, pipelines.length * 30);
    assert.equal(new Set(runs.map((run) => run.id)).size, runs.length);
    for (const pipeline of pipelines) {
      const history = runs.filter((run) => run.pipelineId === pipeline.id);
      assert.equal(history[0].status, pipeline.status);
      assert.equal(history[0].duration, pipeline.duration);
      assert.ok(
        history.every(
          (run) => Date.parse(run.startedAt) <= referenceTime.getTime(),
        ),
      );
      assert.ok(
        history.every(
          (run) =>
            Date.parse(run.startedAt) > referenceTime.getTime() - 30 * 86400000,
        ),
      );
      assert.ok(
        history.every(
          (run, index) =>
            index === 0 ||
            Date.parse(run.startedAt) <
              Date.parse(history[index - 1].startedAt),
        ),
      );
    }
  });
}
test("duration handles pending and completed executions", () => {
  assert.equal(duration(0), "\u2014");
  assert.equal(duration(65), "1m 05s");
});
