import { getItemContent } from "./endpoints.js";
export async function generateQuiz(num_questions, quizTitle, item, service) {
    // get item, generate index from item, generate quiz from index
    const itemContent = await getItemContent(service, item);
    console.log(itemContent);
    return {
        title: quizTitle,
        item: item,
        questions: []
    };
}
//# sourceMappingURL=quiz.js.map