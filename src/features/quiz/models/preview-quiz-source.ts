import { BST_QUIZ_TOPIC } from '@/features/magezi/models/preview-magezi-source';
import type { QuizDefinition, QuizSource } from './quiz';

/**
 * The design's sample quiz on binary search trees (CSC 2100, topic 4).
 * TODO(backend): Magezi builds quizzes from a topic's notes and past papers.
 * TODO(content): sample questions.
 */
const BST_QUIZ: QuizDefinition = {
  topicId: BST_QUIZ_TOPIC,
  topicTitle: 'Trees and binary search trees',
  sources: 'from Lecture 5 and the Dec 2024 paper',
  courseUnitCode: 'CSC 2100',
  questions: [
    {
      id: 'q1',
      prompt: 'In a binary search tree, where does a key smaller than the root go?',
      options: ['To the right', 'To the left', 'It replaces the root', 'Anywhere'],
      correctIndex: 1,
      rightTitle: 'Right, to the left',
      explanation:
        'Smaller keys always go left and bigger keys go right, at every node from the root down.',
    },
    {
      id: 'q2',
      prompt: 'Which traversal reads a binary search tree in sorted order?',
      options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'],
      correctIndex: 2,
      rightTitle: 'Right, in-order',
      explanation:
        'In-order visits the left side, then the node, then the right side, which gives the keys from smallest to largest.',
    },
    {
      id: 'q3',
      prompt: 'You insert 10, 20, 30, 40 into an empty binary search tree. What is its height?',
      options: ['1', '2', '3', '4'],
      correctIndex: 2,
      rightTitle: 'Right, height 3',
      explanation:
        'Every key is bigger than the one before, so each node hangs to the right. You get a chain of 4 nodes, which is why searching it is slow: this is the worst case from question 2(b).',
    },
    {
      id: 'q4',
      prompt: 'What is the worst-case time to search a binary search tree with n nodes?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctIndex: 2,
      rightTitle: 'Right, O(n)',
      explanation:
        'If the tree has become a chain, a search may visit every node, so it takes time in proportion to n.',
    },
    {
      id: 'q5',
      prompt: 'What does an AVL tree do after an insert makes it unbalanced?',
      options: ['Deletes the new key', 'Rotates nodes', 'Sorts all the keys', 'Nothing'],
      correctIndex: 1,
      rightTitle: 'Right, it rotates',
      explanation:
        'Rotations move a few nodes so both sides of every node differ in height by at most 1, keeping searches at about log n steps.',
    },
  ],
};

export class PreviewQuizSource implements QuizSource {
  async forTopic(topicId: string): Promise<QuizDefinition | null> {
    return topicId === BST_QUIZ.topicId ? BST_QUIZ : null;
  }
}
