import { HighspotService } from "./service.js";
export interface HighspotQuiz {
    title: string;
    item: string;
    questions: string[];
}
export declare function generateQuiz(num_questions: number, quizTitle: string, item: string, service: HighspotService): Promise<HighspotQuiz>;
//# sourceMappingURL=quiz.d.ts.map