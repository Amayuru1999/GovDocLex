<<<<<<< Updated upstream
from langchain_community.chat_models import ChatOpenAI
=======
# try:
#     from langchain_openai import ChatOpenAI
# except ImportError:
#     from langchain_community.chat_models import ChatOpenAI
# from langchain_core.prompts import PromptTemplate
# import re
# from typing import List, Dict, Tuple
# from collections import Counter


# class EnhancedQuestionGenerator:
#     def __init__(self):
#         self.llm = ChatOpenAI(temperature=0.5)
#         self.quality_llm = ChatOpenAI(temperature=0.1)
        
#         # Legal domain patterns for Sri Lankan law
#         self.legal_domains = {
#             'civil': ['contract', 'property', 'tort', 'family', 'inheritance'],
#             'criminal': ['offense', 'penalty', 'punishment', 'crime', 'violation'],
#             'commercial': ['business', 'company', 'trade', 'commerce', 'corporate'],
#             'constitutional': ['rights', 'fundamental', 'constitution', 'government'],
#             'procedural': ['procedure', 'court', 'appeal', 'jurisdiction', 'evidence']
#         }
        
#         # Question templates by domain
#         self.domain_templates = {
#             'civil': [
#                 "What are the legal requirements for {topic}?",
#                 "What are the consequences of violating {topic} provisions?",
#                 "How does {topic} affect parties' rights and obligations?",
#                 "What remedies are available under {topic}?"
#             ],
#             'criminal': [
#                 "What constitutes an offense under {topic}?",
#                 "What are the penalties for {topic} violations?",
#                 "What are the procedural requirements for {topic}?",
#                 "What defenses are available for {topic} charges?"
#             ],
#             'commercial': [
#                 "What are the compliance requirements for {topic}?",
#                 "How does {topic} affect business operations?",
#                 "What are the registration/licensing requirements for {topic}?",
#                 "What are the financial implications of {topic}?"
#             ],
#             'constitutional': [
#                 "What fundamental rights are involved in {topic}?",
#                 "How does {topic} balance individual and state interests?",
#                 "What are the constitutional limitations on {topic}?",
#                 "What judicial review standards apply to {topic}?"
#             ],
#             'procedural': [
#                 "What are the step-by-step procedures for {topic}?",
#                 "What are the time limitations for {topic}?",
#                 "What documentation is required for {topic}?",
#                 "What are the appeal processes for {topic}?"
#             ]
#         }

#     def analyze_question_complexity(self, question: str) -> int:
#         """Determine optimal number of mini-questions based on complexity."""
#         complexity_indicators = {
#             'multiple_concepts': len(re.findall(r'\band\b|\bor\b', question.lower())),
#             'legal_terms': len([word for word in question.lower().split() 
#                               if any(term in word for domain_terms in self.legal_domains.values() 
#                                    for term in domain_terms)]),
#             'question_length': len(question.split()),
#             'specific_acts': len(re.findall(r'\bact\b|\blaw\b|\bcode\b', question.lower()))
#         }
        
#         base_score = 3  # Minimum questions
#         complexity_score = (
#             complexity_indicators['multiple_concepts'] * 2 +
#             complexity_indicators['legal_terms'] * 1 +
#             (complexity_indicators['question_length'] // 10) +
#             complexity_indicators['specific_acts'] * 2
#         )
        
#         return min(max(base_score + complexity_score, 3), 10)  # 3-10 range

#     def identify_legal_domain(self, question: str) -> str:
#         """Identify the primary legal domain of the question."""
#         question_lower = question.lower()
#         domain_scores = {}
        
#         for domain, keywords in self.legal_domains.items():
#             score = sum(1 for keyword in keywords if keyword in question_lower)
#             domain_scores[domain] = score
        
#         return max(domain_scores, key=domain_scores.get) if max(domain_scores.values()) > 0 else 'general'

#     def generate_domain_specific_questions(self, question: str, domain: str, num_questions: int) -> List[str]:
#         """Generate questions using domain-specific templates."""
#         if domain not in self.domain_templates:
#             return []
        
#         # Extract key topics from the question
#         topics = self.extract_key_topics(question)
#         templates = self.domain_templates[domain]
        
#         domain_questions = []
#         for i, template in enumerate(templates[:num_questions//2]):
#             if i < len(topics):
#                 domain_questions.append(template.format(topic=topics[i]))
        
#         return domain_questions

#     def extract_key_topics(self, question: str) -> List[str]:
#         """Extract key legal topics from the question."""
#         # Simple extraction - can be enhanced with NER
#         words = question.lower().split()
#         legal_terms = []
        
#         for i, word in enumerate(words):
#             if any(term in word for domain_terms in self.legal_domains.values() 
#                    for term in domain_terms):
#                 # Include context around legal terms
#                 context_start = max(0, i-1)
#                 context_end = min(len(words), i+2)
#                 context = ' '.join(words[context_start:context_end])
#                 legal_terms.append(context)
        
#         return legal_terms[:3] if legal_terms else [question]

#     def score_question_quality(self, mini_question: str, original_question: str) -> float:
#         """Score the quality of a generated mini-question."""
#         prompt = PromptTemplate.from_template(
#             """Rate the quality of this mini-question for helping answer the original legal question. 
#             Consider relevance, specificity, and potential to retrieve useful information.
            
#             Original question: {original}
#             Mini-question: {mini}
            
#             Rate from 1-10 (10 being highest quality). Output only the number."""
#         )
        
#         try:
#             response = self.quality_llm.invoke(
#                 prompt.format(original=original_question, mini=mini_question)
#             ).content.strip()
#             return float(re.findall(r'\d+', response)[0]) / 10.0
#         except:
#             return 0.5  # Default score if scoring fails

#     def generate_mini_questions(self, user_question: str) -> List[str]:
#         """Enhanced mini-question generation with adaptive count and quality scoring."""
#         # Determine optimal number of questions
#         num_mini = self.analyze_question_complexity(user_question)
        
#         # Identify legal domain
#         domain = self.identify_legal_domain(user_question)
        
#         # Generate domain-specific questions
#         domain_questions = self.generate_domain_specific_questions(user_question, domain, num_mini)
        
#         # Generate general decomposition questions
#         general_prompt = PromptTemplate.from_template(
#             """You are an expert legal question decomposer for Sri Lankan law. 
#             Generate {num} diverse mini-questions that will help comprehensively answer the main question.
#             Focus on different aspects: definitions, requirements, procedures, consequences, exceptions, and related provisions.
            
#             Main question: {question}
#             Legal domain: {domain}
            
#             Generate specific, actionable questions that will retrieve relevant legal information.
#             Output only the questions, one per line."""
#         )
        
#         response = self.llm.invoke(
#             general_prompt.format(
#                 question=user_question, 
#                 num=num_mini - len(domain_questions),
#                 domain=domain
#             )
#         ).content
        
#         general_questions = [q.strip() for q in response.split("\n") if q.strip()]
        
#         # Combine and deduplicate
#         all_questions = domain_questions + general_questions
#         unique_questions = list(dict.fromkeys(all_questions))  # Preserve order while removing duplicates
        
#         # Score and filter questions
#         scored_questions = []
#         for q in unique_questions[:num_mini * 2]:  # Generate extra for filtering
#             score = self.score_question_quality(q, user_question)
#             scored_questions.append((q, score))
        
#         # Sort by score and take top questions
#         scored_questions.sort(key=lambda x: x[1], reverse=True)
#         final_questions = [q for q, score in scored_questions[:num_mini] if score > 0.3]
        
#         # Ensure minimum number of questions
#         if len(final_questions) < 3:
#             final_questions.extend([q for q, _ in scored_questions[len(final_questions):3]])
        
#         return final_questions



# # class EnhancedQuestionGenerator:
# #     def __init__(self, retriever_fn=None):
# #         self.llm = ChatOpenAI(temperature=0.5)
# #         self.quality_llm = ChatOpenAI(temperature=0.1)

# #         # Inject retriever callback (for feedback loop)
# #         self.retriever_fn = retriever_fn

# #         self.legal_domains = {
# #             'civil': ['contract', 'property', 'tort', 'family', 'inheritance'],
# #             'criminal': ['offense', 'penalty', 'punishment', 'crime', 'violation'],
# #             'commercial': ['business', 'company', 'trade', 'commerce', 'corporate'],
# #             'constitutional': ['rights', 'fundamental', 'constitution', 'government'],
# #             'procedural': ['procedure', 'court', 'appeal', 'jurisdiction', 'evidence']
# #         }

# #         self.domain_templates = {
# #             'civil': [
# #                 "What are the legal requirements for {topic}?",
# #                 "What are the consequences of violating {topic} provisions?",
# #                 "How does {topic} affect parties' rights and obligations?",
# #                 "What remedies are available under {topic}?"
# #             ],
# #             'criminal': [
# #                 "What constitutes an offense under {topic}?",
# #                 "What are the penalties for {topic} violations?",
# #                 "What are the procedural requirements for {topic}?",
# #                 "What defenses are available for {topic} charges?"
# #             ],
# #             'commercial': [
# #                 "What are the compliance requirements for {topic}?",
# #                 "How does {topic} affect business operations?",
# #                 "What are the registration/licensing requirements for {topic}?",
# #                 "What are the financial implications of {topic}?"
# #             ],
# #             'constitutional': [
# #                 "What fundamental rights are involved in {topic}?",
# #                 "How does {topic} balance individual and state interests?",
# #                 "What are the constitutional limitations on {topic}?",
# #                 "What judicial review standards apply to {topic}?"
# #             ],
# #             'procedural': [
# #                 "What are the step-by-step procedures for {topic}?",
# #                 "What are the time limitations for {topic}?",
# #                 "What documentation is required for {topic}?",
# #                 "What are the appeal processes for {topic}?"
# #             ]
# #         }

# #     def analyze_question_complexity(self, question: str) -> int:
# #         indicators = len(question.split())//8 + len(re.findall(r'\band|\bor', question.lower()))
# #         return max(4, min(10, indicators + 3))

# #     def identify_legal_domain(self, question: str) -> str:
# #         lower = question.lower()
# #         score = {dom: sum(k in lower for k in kws) for dom, kws in self.legal_domains.items()}
# #         best = max(score, key=score.get)
# #         return best if score[best] > 0 else "general"

# #     def answer_type_prediction(self, question: str) -> str:
# #         """Predict answer type: Section / Date / Entity / Yes-No / Concept Definition"""
# #         prompt = f"""
# #         Predict the answer type for the legal question:
# #         Q: "{question}"
# #         Options: section, date, entity, yes_no, concept
# #         Output only one option.
# #         """
# #         try:
# #             t = self.llm.invoke(prompt).content.strip().lower()
# #             return t if t in ["section", "date", "entity", "yes_no", "concept"] else "concept"
# #         except:
# #             return "concept"

# #     def retrieval_feedback_score(self, q: str) -> float:
# #         """Signal boost if retrieval returns strong evidence."""
# #         if not self.retriever_fn:
# #             return 0.0
# #         docs = self.retriever_fn(q)
# #         if not docs:
# #             return 0.0
# #         max_len = max(len(d.page_content) for d in docs)
# #         return min(max_len / 500, 1.0)  # Normalized 0–1

# #     def extract_key_topics(self, q):
# #         return [q]  # (kept simple, you may keep your earlier version)

# #     def score_diversity(self, q: str, all_qs: List[str]):
# #         return 1 - max([len(set(q.split()) & set(x.split())) / len(q.split()) for x in all_qs if x != q] + [0])

# #     def score_semantic_similarity(self, mini, original):
# #         return 1 - abs(len(mini) - len(original)) / max(len(original), 1)

# #     def score_question_quality(self, mini, original):
# #         base_llm_score = 0.6  # Fallback baseline
# #         try:
# #             prompt = PromptTemplate.from_template(
# #                 "Rate 1-10 quality:\nOriginal: {o}\nMini: {m}\nOutput number only."
# #             ).format(o=original, m=mini)
# #             resp = self.quality_llm.invoke(prompt).content.strip()
# #             base_llm_score = float(re.findall(r'\d+', resp)[0]) / 10
# #         except:
# #             pass
# #         return base_llm_score

# #     def generate_mini_questions(self, user_question: str):
# #         num = self.analyze_question_complexity(user_question)
# #         domain = self.identify_legal_domain(user_question)

# #         prompt = f"""
# #         Generate {num} legal mini-questions for RAG decomposition:
# #         Question: {user_question}
# #         Domain: {domain}
# #         Output one per line.
# #         """
# #         raw = self.llm.invoke(prompt).content.split("\n")
# #         mini_qs = [r.strip("-• ").strip() for r in raw if len(r.strip()) > 5]

# #         scored = []
# #         for q in mini_qs:
# #             llm_quality = self.score_question_quality(q, user_question)
# #             sim = self.score_semantic_similarity(q, user_question)
# #             div = self.score_diversity(q, mini_qs)
# #             retrieval_signal = self.retrieval_feedback_score(q)

# #             score = (
# #                 0.4 * llm_quality +
# #                 0.2 * sim +
# #                 0.2 * div +
# #                 0.2 * retrieval_signal
# #             )

# #             scored.append((q, score, self.answer_type_prediction(q)))

# #         scored.sort(key=lambda x: x[1], reverse=True)
# #         final = [(q, t) for q, _, t in scored[:num]]

# #         return final




# # Global instance for backward compatibility
# _generator = EnhancedQuestionGenerator()

# def generate_mini_questions(user_question: str, num_mini: int = None) -> List[str]:
#     """Backward compatible function that uses the enhanced generator."""
#     return _generator.generate_mini_questions(user_question)




try:
    from langchain_openai import ChatOpenAI
except ImportError:
    from langchain_community.chat_models import ChatOpenAI
>>>>>>> Stashed changes
from langchain_core.prompts import PromptTemplate


<<<<<<< Updated upstream
def generate_mini_questions(user_question, num_mini=7):
    llm = ChatOpenAI(temperature=0.5)
    prompt = PromptTemplate.from_template(
        """You are a legal question decomposer. Given a user question about Sri Lankan acts, generate exactly {num} related mini-questions that cover additional details or context to help answer the main question better.
=======
class EnhancedQuestionGenerator:
    def __init__(self):
        self.llm = ChatOpenAI(temperature=0.5)
        self.quality_llm = ChatOpenAI(temperature=0.1)
        
        # Legal domain patterns for Sri Lankan law
        self.legal_domains = {
            'civil': ['contract', 'property', 'tort', 'family', 'inheritance'],
            'criminal': ['offense', 'penalty', 'punishment', 'crime', 'violation'],
            'commercial': ['business', 'company', 'trade', 'commerce', 'corporate'],
            'constitutional': ['rights', 'fundamental', 'constitution', 'government'],
            'procedural': ['procedure', 'court', 'appeal', 'jurisdiction', 'evidence']
        }
        
        # Question templates by domain
        self.domain_templates = {
            'civil': [
                "What are the legal requirements for {topic}?",
                "What are the consequences of violating {topic} provisions?",
                "How does {topic} affect parties' rights and obligations?",
                "What remedies are available under {topic}?"
            ],
            'criminal': [
                "What constitutes an offense under {topic}?",
                "What are the penalties for {topic} violations?",
                "What are the procedural requirements for {topic}?",
                "What defenses are available for {topic} charges?"
            ],
            'commercial': [
                "What are the compliance requirements for {topic}?",
                "How does {topic} affect business operations?",
                "What are the registration/licensing requirements for {topic}?",
                "What are the financial implications of {topic}?"
            ],
            'constitutional': [
                "What fundamental rights are involved in {topic}?",
                "How does {topic} balance individual and state interests?",
                "What are the constitutional limitations on {topic}?",
                "What judicial review standards apply to {topic}?"
            ],
            'procedural': [
                "What are the step-by-step procedures for {topic}?",
                "What are the time limitations for {topic}?",
                "What documentation is required for {topic}?",
                "What are the appeal processes for {topic}?"
            ]
        }
        
        # NEW: Query intent patterns
        self.query_intents = {
            'definition': ['what is', 'define', 'meaning of', 'explain', 'definition of'],
            'procedure': ['how to', 'process for', 'steps to', 'procedure', 'method for'],
            'comparison': ['difference between', 'compare', 'versus', 'vs', 'distinction'],
            'eligibility': ['who can', 'requirements for', 'eligible', 'qualification', 'criteria'],
            'consequence': ['penalty', 'punishment', 'result of', 'consequences', 'what happens if'],
            'timeframe': ['how long', 'duration', 'time limit', 'deadline', 'period'],
            'cost': ['fee', 'cost', 'charge', 'payment', 'how much']
        }
        
        # NEW: Intent-based question templates
        self.intent_templates = {
            'definition': [
                "What is the legal definition of {topic}?",
                "What are the essential elements of {topic}?",
                "How is {topic} interpreted under Sri Lankan law?"
            ],
            'procedure': [
                "What is the step-by-step process for {topic}?",
                "What documents are required for {topic}?",
                "What are the procedural timelines for {topic}?"
            ],
            'comparison': [
                "What are the key differences in {topic}?",
                "How do the provisions compare for {topic}?",
                "What distinguishes {topic} from related concepts?"
            ],
            'eligibility': [
                "What are the eligibility criteria for {topic}?",
                "Who qualifies under {topic}?",
                "What conditions must be met for {topic}?"
            ],
            'consequence': [
                "What are the legal consequences of {topic}?",
                "What penalties apply to {topic}?",
                "What remedies are available for {topic}?"
            ],
            'timeframe': [
                "What are the time limitations for {topic}?",
                "What deadlines apply to {topic}?",
                "How long does {topic} take?"
            ],
            'cost': [
                "What fees are associated with {topic}?",
                "What are the financial implications of {topic}?",
                "What costs are involved in {topic}?"
            ]
        }
>>>>>>> Stashed changes

Main question: {question}

<<<<<<< Updated upstream
Output only the list of mini-questions, one per line, no numbering or extra text."""
    )
    chain = prompt | llm
    response = chain.invoke({"question": user_question, "num": num_mini}).content
    mini_questions = [q.strip() for q in response.split("\n") if q.strip()]
    return mini_questions[:num_mini]  # Ensure exactly num_mini
=======
    def identify_legal_domain(self, question: str) -> str:
        """Identify the primary legal domain of the question."""
        question_lower = question.lower()
        domain_scores = {}
        
        for domain, keywords in self.legal_domains.items():
            score = sum(1 for keyword in keywords if keyword in question_lower)
            domain_scores[domain] = score
        
        return max(domain_scores, key=domain_scores.get) if max(domain_scores.values()) > 0 else 'general'

    # NEW: Intent classification
    def classify_query_intent(self, question: str) -> str:
        """Classify the primary intent of the query."""
        question_lower = question.lower()
        intent_scores = {}
        
        for intent, patterns in self.query_intents.items():
            score = sum(1 for pattern in patterns if pattern in question_lower)
            intent_scores[intent] = score
        
        if max(intent_scores.values()) > 0:
            return max(intent_scores, key=intent_scores.get)
        return 'general'

    # NEW: Entity extraction
    def extract_entities(self, question: str) -> Dict[str, List[str]]:
        """Extract legal entities from question."""
        entities = {
            'acts': re.findall(
                r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+Act(?:\s+(?:No\.)?\s*\d+)?(?:\s+of\s+\d{4})?)', 
                question
            ),
            'sections': re.findall(
                r'(?:Section|section|s\.|§)\s*(\d+(?:\([a-z0-9]+\))?)', 
                question
            ),
            'amounts': re.findall(
                r'(?:Rs\.?|LKR)\s*[\d,]+(?:\.\d{2})?', 
                question
            ),
            'dates': re.findall(
                r'\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\b\d{4}\b', 
                question
            ),
            'organizations': re.findall(
                r'\b(?:Court|Ministry|Department|Commission|Authority|Board)\s+of\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*', 
                question
            )
        }
        return {k: v for k, v in entities.items() if v}

    # NEW: Extract main topic
    def extract_main_topic(self, question: str) -> str:
        """Extract main topic from question."""
        # Remove question words and common phrases
        clean_q = re.sub(
            r'\b(what|when|where|who|why|how|is|are|does|do|can|could|would|should|the|a|an)\b', 
            '', 
            question.lower()
        )
        clean_q = clean_q.strip('? ').strip()
        
        # Extract noun phrases (simple approach)
        words = clean_q.split()
        if len(words) > 4:
            return ' '.join(words[:5])
        return clean_q if clean_q else question

    def generate_domain_specific_questions(self, question: str, domain: str, num_questions: int) -> List[str]:
        """Generate questions using domain-specific templates."""
        if domain not in self.domain_templates:
            return []
        
        # Extract key topics from the question
        topics = self.extract_key_topics(question)
        templates = self.domain_templates[domain]
        
        domain_questions = []
        for i, template in enumerate(templates[:num_questions//2]):
            if i < len(topics):
                domain_questions.append(template.format(topic=topics[i]))
        
        return domain_questions

    # NEW: Intent-based question generation
    def generate_intent_based_questions(self, question: str, intent: str, num_questions: int = 2) -> List[str]:
        """Generate questions based on detected intent."""
        if intent not in self.intent_templates:
            return []
        
        main_topic = self.extract_main_topic(question)
        templates = self.intent_templates[intent]
        
        intent_questions = []
        for template in templates[:num_questions]:
            intent_questions.append(template.format(topic=main_topic))
        
        return intent_questions

    # NEW: Entity-based question generation
    def generate_entity_based_questions(self, question: str, entities: Dict[str, List[str]]) -> List[str]:
        """Generate questions based on extracted entities."""
        entity_questions = []
        
        # Questions about specific acts
        if 'acts' in entities:
            for act in entities['acts'][:2]:
                entity_questions.extend([
                    f"What are the key provisions of {act}?",
                    f"What are the objectives of {act}?",
                    f"What penalties are specified in {act}?"
                ])
        
        # Questions about specific sections
        if 'sections' in entities:
            for section in entities['sections'][:2]:
                entity_questions.extend([
                    f"What does Section {section} specifically state?",
                    f"What are the requirements under Section {section}?",
                    f"What are the exceptions to Section {section}?"
                ])
        
        # Questions about organizations
        if 'organizations' in entities:
            for org in entities['organizations'][:1]:
                entity_questions.extend([
                    f"What is the role of {org} in this matter?",
                    f"What powers does {org} have?"
                ])
        
        return entity_questions

    def extract_key_topics(self, question: str) -> List[str]:
        """Extract key legal topics from the question."""
        # Simple extraction - can be enhanced with NER
        words = question.lower().split()
        legal_terms = []
        
        for i, word in enumerate(words):
            if any(term in word for domain_terms in self.legal_domains.values() 
                   for term in domain_terms):
                # Include context around legal terms
                context_start = max(0, i-1)
                context_end = min(len(words), i+2)
                context = ' '.join(words[context_start:context_end])
                legal_terms.append(context)
        
        return legal_terms[:3] if legal_terms else [question]

    # NEW: Diversity scoring
    def score_diversity(self, candidate_question: str, existing_questions: List[str]) -> float:
        """Score how diverse a question is compared to existing questions."""
        if not existing_questions:
            return 1.0
        
        candidate_words = set(candidate_question.lower().split())
        
        max_overlap = 0
        for existing_q in existing_questions:
            existing_words = set(existing_q.lower().split())
            if candidate_words:
                overlap = len(candidate_words & existing_words) / len(candidate_words)
                max_overlap = max(max_overlap, overlap)
        
        return 1.0 - max_overlap

    def score_question_quality(self, mini_question: str, original_question: str) -> float:
        """Score the quality of a generated mini-question."""
        prompt = PromptTemplate.from_template(
            """Rate the quality of this mini-question for helping answer the original legal question. 
            Consider relevance, specificity, and potential to retrieve useful information.
            
            Original question: {original}
            Mini-question: {mini}
            
            Rate from 1-10 (10 being highest quality). Output only the number."""
        )
        
        try:
            response = self.quality_llm.invoke(
                prompt.format(original=original_question, mini=mini_question)
            ).content.strip()
            return float(re.findall(r'\d+', response)[0]) / 10.0
        except:
            return 0.5  # Default score if scoring fails

    # NEW: Combined scoring with multiple factors
    def score_question_comprehensive(self, mini_question: str, original_question: str, 
                                    existing_questions: List[str]) -> float:
        """Comprehensive scoring combining quality, diversity, and specificity."""
        # Base quality score from LLM
        quality_score = self.score_question_quality(mini_question, original_question)
        
        # Diversity score
        diversity_score = self.score_diversity(mini_question, existing_questions)
        
        # Specificity score (based on presence of specific terms)
        specificity_indicators = [
            bool(re.search(r'Section \d+', mini_question)),
            bool(re.search(r'Act(?:\s+No\.)?\s*\d+', mini_question)),
            len(mini_question.split()) > 5,  # Not too short
            len(mini_question.split()) < 20  # Not too long
        ]
        specificity_score = sum(specificity_indicators) / len(specificity_indicators)
        
        # Combined score with weights
        combined_score = (
            0.5 * quality_score +
            0.3 * diversity_score +
            0.2 * specificity_score
        )
        
        return combined_score

    def generate_mini_questions(self, user_question: str) -> List[str]:
        """Enhanced mini-question generation with adaptive count and quality scoring."""
        # Determine optimal number of questions
        num_mini = self.analyze_question_complexity(user_question)
        
        # Identify legal domain and intent
        domain = self.identify_legal_domain(user_question)
        intent = self.classify_query_intent(user_question)
        
        # Extract entities
        entities = self.extract_entities(user_question)
        
        print(f"[Generator] Complexity: {num_mini} questions | Domain: {domain} | Intent: {intent}")
        if entities:
            print(f"[Generator] Extracted entities: {entities}")
        
        # Collect questions from different sources
        all_questions = []
        
        # 1. Entity-based questions (highest priority)
        if entities:
            entity_questions = self.generate_entity_based_questions(user_question, entities)
            all_questions.extend(entity_questions[:3])
        
        # 2. Intent-based questions
        intent_questions = self.generate_intent_based_questions(user_question, intent, 2)
        all_questions.extend(intent_questions)
        
        # 3. Domain-specific questions
        domain_questions = self.generate_domain_specific_questions(user_question, domain, num_mini)
        all_questions.extend(domain_questions)
        
        # 4. Generate general decomposition questions
        general_prompt = PromptTemplate.from_template(
            """You are an expert legal question decomposer for Sri Lankan law. 
            Generate {num} diverse mini-questions that will help comprehensively answer the main question.
            Focus on different aspects: definitions, requirements, procedures, consequences, exceptions, and related provisions.
            
            Main question: {question}
            Legal domain: {domain}
            Query intent: {intent}
            
            Generate specific, actionable questions that will retrieve relevant legal information.
            Each question should focus on a different aspect.
            Output only the questions, one per line, without numbering."""
        )
        
        try:
            response = self.llm.invoke(
                general_prompt.format(
                    question=user_question, 
                    num=max(num_mini - len(all_questions), 2),
                    domain=domain,
                    intent=intent
                )
            ).content
            
            general_questions = [q.strip().lstrip('0123456789.-) ') for q in response.split("\n") if q.strip()]
            all_questions.extend(general_questions)
        except Exception as e:
            print(f"[Generator] Warning: LLM generation failed: {e}")
        
        # Deduplicate while preserving order
        seen = set()
        unique_questions = []
        for q in all_questions:
            q_lower = q.lower().strip()
            if q_lower and q_lower not in seen and len(q) > 10:
                seen.add(q_lower)
                unique_questions.append(q)
        
        # Score and rank questions with comprehensive scoring
        scored_questions = []
        for q in unique_questions[:num_mini * 3]:  # Generate extra for filtering
            score = self.score_question_comprehensive(q, user_question, [sq[0] for sq in scored_questions])
            scored_questions.append((q, score))
        
        # Sort by score and take top questions
        scored_questions.sort(key=lambda x: x[1], reverse=True)
        
        # Filter by minimum quality threshold
        final_questions = [q for q, score in scored_questions if score > 0.3][:num_mini]
        
        # Ensure minimum number of questions
        if len(final_questions) < 3:
            # Add lower-scoring questions if needed
            additional = [q for q, score in scored_questions[len(final_questions):] if score > 0.2]
            final_questions.extend(additional[:3 - len(final_questions)])
        
        # If still not enough, add the original question decomposed simply
        if len(final_questions) < 3:
            final_questions.append(user_question)
            final_questions.append(f"What are the legal provisions related to {self.extract_main_topic(user_question)}?")
            final_questions.append(f"What are the requirements and procedures for {self.extract_main_topic(user_question)}?")
        
        # Remove duplicates one final time
        final_unique = []
        seen_final = set()
        for q in final_questions:
            if q.lower() not in seen_final:
                seen_final.add(q.lower())
                final_unique.append(q)
        
        print(f"[Generator] Generated {len(final_unique)} final questions")
        return final_unique[:num_mini]


# Global instance for backward compatibility
_generator = EnhancedQuestionGenerator()

def generate_mini_questions(user_question: str, num_mini: int = None) -> List[str]:
    """Backward compatible function that uses the enhanced generator."""
    return _generator.generate_mini_questions(user_question)
>>>>>>> Stashed changes
