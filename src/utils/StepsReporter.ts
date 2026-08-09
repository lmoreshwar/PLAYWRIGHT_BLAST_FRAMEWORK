import type { Reporter, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * StepsReporter — writes `test-results/steps.json` mapping each test title to its
 * ordered steps. Playwright's built-in JSON reporter omits steps, so B.L.A.S.T. uses
 * this to render a step-by-step breakdown in the in-app automation report.
 */
type ReportStep = { title: string; status: 'passed' | 'failed' };

export default class StepsReporter implements Reporter {
    private byTest: Record<string, ReportStep[]> = {};

    onTestEnd(test: TestCase, result: TestResult): void {
        const steps: ReportStep[] = [];
        const visit = (s: TestStep, depth: number): void => {
            if (s.category !== 'hook' && s.category !== 'fixture' && s.title) {
                steps.push({ title: s.title, status: s.error ? 'failed' : 'passed' });
            }
            if (depth < 1) (s.steps || []).forEach((child) => visit(child, depth + 1));
        };
        (result.steps || []).forEach((s) => visit(s, 0));
        this.byTest[test.title] = steps.slice(0, 60);
    }

    onEnd(): void {
        try {
            const dir = path.resolve(process.cwd(), 'test-results');
            fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, 'steps.json'), JSON.stringify(this.byTest));
        } catch {
            // non-fatal — the report simply falls back to no steps
        }
    }
}
