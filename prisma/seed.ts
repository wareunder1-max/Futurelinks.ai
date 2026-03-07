import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create initial admin account
  const adminUsername = process.env.INITIAL_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (!adminPassword) {
    console.warn('⚠️  INITIAL_ADMIN_PASSWORD not set in environment variables');
    console.warn('⚠️  Skipping admin account creation');
  } else {
    try {
      // Hash the admin password before storage
      const passwordHash = await hashPassword(adminPassword);

      // Create or update admin account
      const admin = await prisma.admin.upsert({
        where: { username: adminUsername },
        update: {
          passwordHash,
          lastLoginAt: new Date(),
        },
        create: {
          username: adminUsername,
          passwordHash,
        },
      });

      console.log('✅ Created/updated admin account:', admin.username);
    } catch (error) {
      console.error('❌ Failed to create admin account:', error);
      throw error;
    }
  }

  // Create sample blog post
  const blogPost = await prisma.blogPost.upsert({
    where: { slug: 'welcome-to-ai-futurelinks' },
    update: {},
    create: {
      slug: 'welcome-to-ai-futurelinks',
      title: 'Welcome to AI FutureLinks: The Evolution of the Interface',
      excerpt:
        'Discover the future of AI interaction with our model-agnostic workspace. Toggle between OpenAI and Google Gemini in a single click.',
      content: `# Welcome to AI FutureLinks

The era of the simple text box is over. Welcome to AI FutureLinks, the first model-agnostic workspace designed for the 2026 workflow.

## What Makes AI FutureLinks Different?

### Multi-Model Switching
Toggle between the deep reasoning of OpenAI and the massive context of Google Gemini in a single click. No more juggling multiple tabs or subscriptions.

### Real-Time Artifacts
Watch your ideas come to life in our real-time Artifacts window. Code, documents, and visualizations appear instantly as you work.

### Integrated Storage
Maintain a perfect memory of your projects with integrated serverless storage. Never lose track of your conversations or creations.

## Getting Started

1. Sign in with your Google account
2. Start chatting with AI
3. Switch models as needed
4. Save your work automatically

Don't just use AI—master it with AI FutureLinks.`,
      metaDescription:
        'Welcome to AI FutureLinks - The model-agnostic AI workspace for the 2026 workflow. Toggle between OpenAI and Google Gemini seamlessly.',
      keywords: JSON.stringify([
        'AI workspace',
        'multi-model AI',
        'OpenAI',
        'Google Gemini',
        'AI interface',
        'model-agnostic',
        '2026 workflow',
      ]),
      author: 'AI FutureLinks Team',
      featuredImage: null,
      publishedAt: new Date(),
    },
  });

  console.log('✅ Created blog post:', blogPost.title);

  // Create additional sample blog posts
  const blogPost2 = await prisma.blogPost.upsert({
    where: { slug: 'openai-vs-google-gemini-comparison' },
    update: {},
    create: {
      slug: 'openai-vs-google-gemini-comparison',
      title: 'OpenAI vs Google Gemini: A Comprehensive Comparison for 2026',
      excerpt:
        'Compare OpenAI and Google Gemini side-by-side. Learn which AI model excels at reasoning, context handling, and real-world applications.',
      content: `# OpenAI vs Google Gemini: A Comprehensive Comparison for 2026

Choosing the right AI model can make or break your workflow. Here's everything you need to know about OpenAI and Google Gemini.

## Deep Reasoning: OpenAI's Strength

OpenAI excels at complex reasoning tasks. When you need step-by-step problem solving, logical deduction, or mathematical computations, OpenAI delivers consistent results.

### Best Use Cases for OpenAI
- Code debugging and optimization
- Mathematical problem solving
- Logical reasoning tasks
- Structured data analysis

## Massive Context: Google Gemini's Advantage

Google Gemini shines with its enormous context window. Process entire codebases, lengthy documents, or extensive conversation histories without losing track.

### Best Use Cases for Google Gemini
- Document analysis and summarization
- Large codebase understanding
- Long-form content creation
- Multi-document research

## The Model-Agnostic Solution

Why choose when you can have both? AI FutureLinks lets you switch between models instantly, leveraging each model's strengths for different tasks.

### Workflow Example
1. Use Gemini to analyze a large codebase
2. Switch to OpenAI for debugging specific functions
3. Return to Gemini for documentation generation
4. Use OpenAI for final code optimization

## Performance Metrics

| Feature | OpenAI | Google Gemini |
|---------|--------|---------------|
| Reasoning Depth | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Context Window | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Code Generation | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Speed | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## Conclusion

Both models have unique strengths. The future of AI work isn't about choosing one—it's about seamlessly switching between them based on your current task.`,
      metaDescription:
        'OpenAI vs Google Gemini comparison for 2026. Discover which AI model excels at reasoning, context handling, and real-world applications in our comprehensive guide.',
      keywords: JSON.stringify([
        'OpenAI vs Google Gemini',
        'AI model comparison',
        'multi-model AI',
        'AI reasoning',
        'context window',
        'model-agnostic workspace',
        'AI performance',
      ]),
      author: 'AI FutureLinks Team',
      featuredImage: null,
      publishedAt: new Date('2024-01-15'),
    },
  });

  console.log('✅ Created blog post:', blogPost2.title);

  const blogPost3 = await prisma.blogPost.upsert({
    where: { slug: 'mastering-2026-ai-workflow' },
    update: {},
    create: {
      slug: 'mastering-2026-ai-workflow',
      title: 'Mastering the 2026 AI Workflow: Beyond the Simple Text Box',
      excerpt:
        'The 2026 AI workflow demands more than basic chat interfaces. Learn how advanced AI workspaces are transforming productivity.',
      content: `# Mastering the 2026 AI Workflow: Beyond the Simple Text Box

The simple text box interface is obsolete. Modern AI workflows require sophisticated tools that match the complexity of real-world tasks.

## What is the 2026 Workflow?

The 2026 workflow represents a paradigm shift in how we interact with AI:

### Key Characteristics
- **Multi-model switching**: Access different AI models for different tasks
- **Real-time artifacts**: See code, documents, and visualizations as they're created
- **Persistent memory**: Maintain context across sessions and projects
- **Integrated storage**: Never lose your work or conversation history

## The Problem with Traditional Chat Interfaces

Traditional AI chat interfaces have fundamental limitations:

1. **Single model lock-in**: You're stuck with one AI's strengths and weaknesses
2. **No visual feedback**: Code and documents appear as plain text
3. **Lost context**: Conversations disappear when you close the tab
4. **Manual switching**: Juggling multiple AI subscriptions and tabs

## The Advanced AI Workspace Solution

Modern AI workspaces solve these problems with integrated features:

### Real-Time Artifacts Window
Watch your code come to life as the AI writes it. See syntax highlighting, structure, and immediate visual feedback.

### Serverless Project Storage
Every conversation, every artifact, every iteration is automatically saved. Pick up exactly where you left off, days or weeks later.

### Intelligent Model Routing
The workspace suggests which model to use based on your task. Need deep reasoning? Switch to OpenAI. Processing a large document? Use Gemini.

## Practical Workflow Examples

### Software Development
\`\`\`
1. Analyze requirements with Gemini (large context)
2. Generate code structure with OpenAI (reasoning)
3. Review in Artifacts window (visual feedback)
4. Save to project storage (persistence)
\`\`\`

### Content Creation
\`\`\`
1. Research with Gemini (document analysis)
2. Outline with OpenAI (logical structure)
3. Draft in Artifacts (real-time preview)
4. Iterate with saved context (memory)
\`\`\`

## Measuring Productivity Gains

Users report significant improvements:
- 40% faster task completion
- 60% reduction in context switching
- 80% better project continuity
- 90% less time managing AI tools

## Getting Started with the 2026 Workflow

1. Choose a model-agnostic workspace
2. Learn each model's strengths
3. Develop switching habits
4. Leverage artifacts and storage
5. Build persistent project memory

## The Future is Multi-Model

The 2026 workflow isn't about using AI—it's about mastering AI. Single-model interfaces are training wheels. Advanced workspaces are the real bicycle.`,
      metaDescription:
        'Master the 2026 AI workflow with advanced AI workspaces. Learn multi-model switching, real-time artifacts, and persistent memory for maximum productivity.',
      keywords: JSON.stringify([
        '2026 AI workflow',
        'advanced AI interface',
        'AI workspace',
        'multi-model AI switching',
        'AI productivity',
        'real-time artifacts',
        'AI project storage',
        'model-agnostic',
      ]),
      author: 'AI FutureLinks Team',
      featuredImage: null,
      publishedAt: new Date('2024-01-20'),
    },
  });

  console.log('✅ Created blog post:', blogPost3.title);

  const blogPost4 = await prisma.blogPost.upsert({
    where: { slug: 'ai-artifacts-code-preview-guide' },
    update: {},
    create: {
      slug: 'ai-artifacts-code-preview-guide',
      title: 'AI Artifacts and Code Preview: The Visual Revolution in AI Interaction',
      excerpt:
        'Discover how real-time AI artifacts transform code generation, document creation, and visual feedback in modern AI workspaces.',
      content: `# AI Artifacts and Code Preview: The Visual Revolution in AI Interaction

Plain text AI responses are limiting. Real-time artifacts provide immediate visual feedback that transforms how we work with AI.

## What Are AI Artifacts?

AI artifacts are visual representations of AI-generated content that appear in real-time as the AI creates them.

### Types of Artifacts
- **Code blocks**: Syntax-highlighted, structured code
- **Documents**: Formatted text with headings and styles
- **Visualizations**: Charts, diagrams, and graphics
- **Interactive elements**: Buttons, forms, and UI components

## The Problem with Text-Only Responses

Traditional AI interfaces show everything as plain text:

\`\`\`
User: "Write a React component"
AI: "Here's a React component: function MyComponent() { return <div>..."
\`\`\`

You have to:
1. Read through the text
2. Copy the code
3. Paste into your editor
4. Format and review
5. Test and iterate

## The Artifacts Solution

With real-time artifacts, you see the code as it's written:

### Immediate Benefits
- **Syntax highlighting**: Spot errors instantly
- **Structure visualization**: See component hierarchy
- **Live preview**: Watch the code take shape
- **Copy with formatting**: One-click to clipboard

## Code Preview in Action

### Before Artifacts
\`\`\`typescript
// Plain text response - hard to read
function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }
\`\`\`

### With Artifacts
\`\`\`typescript
// Formatted, highlighted, structured
function calculateTotal(items: Item[]): number {
  return items.reduce(
    (sum, item) => sum + item.price,
    0
  );
}
\`\`\`

## Advanced Artifact Features

### Multi-File Projects
See entire project structures with file trees and navigation.

### Diff Visualization
Compare versions side-by-side when the AI makes changes.

### Interactive Execution
Run code directly in the artifacts window for immediate testing.

### Export Options
Download as files, copy to clipboard, or push to repositories.

## Workflow Integration

### Development Workflow
1. Request code from AI
2. Review in artifacts window
3. Iterate with visual feedback
4. Export to your project

### Documentation Workflow
1. Generate documentation
2. Preview formatted output
3. Adjust styling and structure
4. Export as markdown or HTML

## Productivity Impact

Real-time artifacts reduce friction:
- **50% faster code review**: Visual structure beats text scanning
- **70% fewer copy-paste errors**: Formatted code copies correctly
- **80% better iteration speed**: See changes immediately
- **90% improved comprehension**: Visual feedback aids understanding

## Best Practices

### Requesting Artifacts
Be specific about what you want to see:
- "Show me a React component with TypeScript"
- "Generate a Python class with docstrings"
- "Create a markdown document with sections"

### Reviewing Artifacts
Use the visual feedback:
- Check syntax highlighting for errors
- Verify structure and indentation
- Test interactive elements
- Compare with previous versions

### Iterating with Artifacts
Make targeted requests:
- "Add error handling to the try block"
- "Refactor the loop into a map function"
- "Add TypeScript types to the parameters"

## The Future of AI Interaction

Artifacts represent the evolution from text-based to visual AI interaction. As AI becomes more capable, visual feedback becomes essential for managing complexity.

### Coming Soon
- Real-time collaboration on artifacts
- Version control integration
- AI-suggested improvements with visual diffs
- Multi-artifact project management

## Getting Started

1. Choose an AI workspace with artifact support
2. Request code or documents
3. Review in the artifacts window
4. Iterate with visual feedback
5. Export when ready

The future of AI interaction is visual. Artifacts are the interface.`,
      metaDescription:
        'Learn how AI artifacts and real-time code preview revolutionize AI interaction. Discover visual feedback, syntax highlighting, and instant code generation.',
      keywords: JSON.stringify([
        'AI artifacts',
        'code preview',
        'real-time AI',
        'visual AI feedback',
        'AI code generation',
        'syntax highlighting',
        'AI workspace',
        'interactive AI',
      ]),
      author: 'AI FutureLinks Team',
      featuredImage: null,
      publishedAt: new Date('2024-01-25'),
    },
  });

  console.log('✅ Created blog post:', blogPost4.title);

  const blogPost5 = await prisma.blogPost.upsert({
    where: { slug: 'serverless-ai-project-storage-guide' },
    update: {},
    create: {
      slug: 'serverless-ai-project-storage-guide',
      title: 'Serverless AI Project Storage: Never Lose Your AI Conversations Again',
      excerpt:
        'Discover how serverless storage transforms AI workflows by maintaining perfect memory of your projects, conversations, and iterations.',
      content: `# Serverless AI Project Storage: Never Lose Your AI Conversations Again

Losing AI conversations means losing context, iterations, and valuable work. Serverless storage solves this with automatic, persistent project memory.

## The Context Loss Problem

Traditional AI chat interfaces have a critical flaw: conversations disappear.

### Common Scenarios
- Close the tab → lose everything
- Browser crash → work vanished
- Switch devices → start from scratch
- Return later → no memory of previous work

### The Cost of Lost Context
- Repeat explanations to the AI
- Recreate previous iterations
- Lose valuable insights
- Waste time rebuilding context

## What is Serverless AI Storage?

Serverless storage automatically saves every interaction with AI without manual intervention.

### Key Features
- **Automatic saving**: Every message, every response
- **Persistent memory**: Access from any device
- **Version history**: See all iterations
- **Project organization**: Group related conversations
- **Zero maintenance**: No servers to manage

## How It Works

### Traditional Approach
\`\`\`
User → AI Chat → Browser Memory → Lost on Close
\`\`\`

### Serverless Storage Approach
\`\`\`
User → AI Chat → Automatic Save → Cloud Storage → Available Everywhere
\`\`\`

## Benefits for Different Workflows

### Software Development
- **Project continuity**: Pick up where you left off
- **Code evolution**: Track how solutions developed
- **Team collaboration**: Share conversation history
- **Learning resource**: Review past problem-solving

### Content Creation
- **Draft history**: See how content evolved
- **Idea preservation**: Never lose a good concept
- **Iteration tracking**: Compare versions easily
- **Research archive**: Maintain research conversations

### Research and Analysis
- **Data persistence**: Keep analysis conversations
- **Source tracking**: Remember where insights came from
- **Methodology record**: Document your process
- **Reproducibility**: Recreate analysis steps

## Advanced Storage Features

### Smart Organization
Conversations automatically group by:
- Project or topic
- Date and time
- AI model used
- Artifact types created

### Search and Discovery
Find past conversations by:
- Keywords and phrases
- Date ranges
- AI model
- Project tags

### Version Control
Track changes over time:
- See all iterations
- Compare versions
- Restore previous states
- Branch conversations

### Export and Sharing
Share your work:
- Export as markdown
- Generate PDFs
- Share conversation links
- Collaborate with teams

## Privacy and Security

### Data Protection
- End-to-end encryption
- Secure cloud storage
- Access control
- GDPR compliance

### User Control
- Delete conversations
- Export your data
- Manage permissions
- Control sharing

## Practical Use Cases

### Long-Term Projects
\`\`\`
Week 1: Initial planning with AI
Week 2: Continue from saved context
Week 3: Reference previous decisions
Week 4: Complete with full history
\`\`\`

### Multi-Device Workflow
\`\`\`
Morning: Start on desktop
Commute: Review on mobile
Evening: Continue on laptop
All with perfect continuity
\`\`\`

### Team Collaboration
\`\`\`
Developer A: Creates initial solution
Developer B: Reviews and iterates
Developer C: Implements final version
All see complete conversation history
\`\`\`

## Performance and Scalability

### Storage Efficiency
- Compressed conversation data
- Incremental saves
- Efficient retrieval
- Fast search indexing

### Scalability
- Unlimited conversations
- No storage limits
- Global availability
- Instant synchronization

## Best Practices

### Organizing Projects
1. Use descriptive project names
2. Tag conversations by topic
3. Archive completed projects
4. Regular cleanup of test conversations

### Maximizing Value
1. Review past conversations for insights
2. Build on previous solutions
3. Share valuable conversations with team
4. Export important work regularly

### Security Hygiene
1. Don't store sensitive credentials
2. Review sharing permissions
3. Use strong authentication
4. Regular security audits

## The Future of AI Memory

Serverless storage is just the beginning:

### Coming Innovations
- AI-powered conversation summaries
- Automatic project linking
- Cross-conversation insights
- Predictive context loading

## Getting Started

1. Choose an AI workspace with serverless storage
2. Start conversations normally
3. Everything saves automatically
4. Access from anywhere, anytime

## Conclusion

Serverless AI project storage transforms AI from a stateless tool into a persistent workspace. Never lose context, never repeat yourself, never start from scratch.

The future of AI work is persistent, accessible, and always available.`,
      metaDescription:
        'Serverless AI project storage ensures you never lose AI conversations. Learn about automatic saving, persistent memory, and perfect project continuity.',
      keywords: JSON.stringify([
        'serverless AI storage',
        'AI project memory',
        'persistent AI conversations',
        'AI workspace storage',
        'cloud AI storage',
        'AI context preservation',
        'automatic AI saving',
        'AI project continuity',
      ]),
      author: 'AI FutureLinks Team',
      featuredImage: null,
      publishedAt: new Date('2024-01-30'),
    },
  });

  console.log('✅ Created blog post:', blogPost5.title);

  // Create a blog post demonstrating semantic HTML features
  const blogPost6 = await prisma.blogPost.upsert({
    where: { slug: 'ai-terminology-guide' },
    update: {},
    create: {
      slug: 'ai-terminology-guide',
      title: 'AI Terminology Guide: Essential Concepts for 2026',
      excerpt:
        'Master essential AI terminology with our comprehensive guide. Learn key concepts, compare technologies, and understand the language of modern AI.',
      content: `# AI Terminology Guide: Essential Concepts for 2026

Understanding AI terminology is crucial for effective communication and decision-making in the modern AI landscape.

## Core AI Concepts

API Key: A credential string used to authenticate with external AI service providers and track usage.

Context Window: The maximum amount of text an AI model can process in a single request, measured in tokens.

Token: A unit of text processing in AI models, typically representing a word or part of a word.

Model Temperature: A parameter controlling randomness in AI responses, ranging from 0 (deterministic) to 1 (creative).

## AI Model Comparison

| Feature | OpenAI GPT-4 | Google Gemini | Anthropic Claude |
|---------|--------------|---------------|------------------|
| Context Window | 128K tokens | 1M tokens | 200K tokens |
| Reasoning Strength | Excellent | Very Good | Excellent |
| Code Generation | Excellent | Very Good | Very Good |
| Speed | Fast | Very Fast | Fast |
| Cost per 1M tokens | $30 | $7 | $15 |

## Implementation Examples

### TypeScript API Integration

\`\`\`typescript
interface AIRequest {
  model: string;
  messages: Message[];
  temperature: number;
  maxTokens: number;
}

async function callAI(request: AIRequest): Promise<string> {
  const response = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  return response.json();
}
\`\`\`

### Python API Integration

\`\`\`python
import requests

def call_ai(model, messages, temperature=0.7):
    response = requests.post(
        'https://api.example.com/chat',
        json={
            'model': model,
            'messages': messages,
            'temperature': temperature
        }
    )
    return response.json()
\`\`\`

## Expert Insights

> The future of AI is not about choosing one model, but about seamlessly switching between them based on the task at hand.
> -- Andrew Ng, AI Pioneer

> Context windows are the new RAM. The more context you can process, the more sophisticated your AI applications become.
> -- Demis Hassabis, Google DeepMind

## Advanced Concepts

### Prompt Engineering

Prompt Engineering: The practice of crafting effective instructions for AI models to achieve desired outputs.

Few-Shot Learning: Providing examples in the prompt to guide the AI's response format and style.

Chain of Thought: Instructing the AI to show its reasoning process step-by-step for better accuracy.

### Model Architecture

Transformer Architecture: The neural network design underlying modern large language models, enabling parallel processing.

Attention Mechanism: The core component allowing models to focus on relevant parts of input text.

Fine-Tuning: Adapting a pre-trained model to specific tasks or domains with additional training.

## Best Practices

### Choosing the Right Model

1. **For deep reasoning tasks**: Use OpenAI GPT-4 or Anthropic Claude
2. **For large document analysis**: Use Google Gemini with its 1M token context
3. **For cost-effective solutions**: Consider model size vs. task complexity
4. **For real-time applications**: Prioritize models with faster response times

### Optimizing API Usage

1. **Monitor token consumption**: Track usage to control costs
2. **Implement caching**: Store common responses to reduce API calls
3. **Use appropriate temperature**: Lower for factual tasks, higher for creative work
4. **Batch requests**: Combine multiple queries when possible

## Security Considerations

API Key Management: Store keys securely using environment variables and encryption, never commit to version control.

Rate Limiting: Implement request throttling to prevent abuse and control costs.

Input Validation: Sanitize user inputs before sending to AI models to prevent injection attacks.

## Future Trends

### Emerging Technologies

Multimodal Models: AI systems that process text, images, audio, and video simultaneously.

Retrieval-Augmented Generation: Combining AI models with external knowledge bases for more accurate responses.

Agent Systems: Autonomous AI that can plan, execute, and iterate on complex tasks.

### Industry Evolution

The AI landscape is rapidly evolving:

- **2024**: Single-model dominance
- **2025**: Multi-model experimentation
- **2026**: Model-agnostic workflows become standard
- **2027+**: Specialized models for specific domains

## Conclusion

Mastering AI terminology empowers you to make informed decisions, communicate effectively with technical teams, and leverage the full potential of modern AI systems.

## Additional Resources

For more information on AI concepts and best practices:

- OpenAI Documentation: https://platform.openai.com/docs
- Google AI Documentation: https://ai.google.dev/docs
- Anthropic Claude Documentation: https://docs.anthropic.com

Stay updated with the latest AI terminology and trends at AI FutureLinks.`,
      metaDescription:
        'Comprehensive AI terminology guide for 2026. Learn essential concepts, compare AI models, and master the language of modern artificial intelligence.',
      keywords: JSON.stringify([
        'AI terminology',
        'AI concepts',
        'AI glossary',
        'machine learning terms',
        'AI model comparison',
        'context window',
        'API key',
        'prompt engineering',
        'AI best practices',
      ]),
      author: 'AI FutureLinks Team',
      featuredImage: null,
      publishedAt: new Date('2024-02-01'),
    },
  });

  console.log('✅ Created blog post:', blogPost6.title);

  console.log('\n📝 Seed completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Run: npx prisma studio to view your data');
  console.log('2. Configure API keys in the admin dashboard');
  console.log(`3. Admin login: ${adminUsername} / [password from INITIAL_ADMIN_PASSWORD]`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
