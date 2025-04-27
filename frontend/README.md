# Russian Stress Practice

A web application to help learners practice Russian word stress. Correctly placing stress in Russian words is crucial for proper pronunciation and understanding.

## Live Demo

Visit the application at: [https://denissud.github.io/russian-stress-practice/](https://denissud.github.io/russian-stress-practice/)

## Features

- Interactive practice of Russian word stress patterns
- Words with stress patterns built into the application
- Immediate feedback on correct and incorrect answers
- Track incorrect words for focused practice
- Toggle between practicing all words or just mistakes
- Responsive design works on desktop and mobile devices

## How to Use

1. When a word appears, click on the vowel where you think the stress belongs
2. Get immediate feedback on your answer
3. See the correct stress pattern highlighted
4. Click "Next Word" to continue practicing
5. Use the sidebar to see your mistakes and switch practice modes

## Local Development

### Prerequisites

- Node.js (version 18 or higher)
- npm, yarn, or pnpm

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/DenisSud/russian-stress-practice.git
   cd russian-stress-practice
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173/russian-stress-practice/`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

This project is set up to deploy automatically to GitHub Pages using GitHub Actions.

When you push changes to the `main` branch, the GitHub Actions workflow will:
1. Build the application
2. Deploy it to GitHub Pages

The application will be available at: `https://denissud.github.io/russian-stress-practice/`

## Technologies Used

- React
- Vite
- Tailwind CSS
- GitHub Actions (for CI/CD)
- GitHub Pages (for hosting)

## Adding More Words

To add more Russian words to the practice set:

1. Edit the `src/App.jsx` file
2. Add new words to the `rawWords` array with uppercase letters indicating stress
   - Example: `"вОвремя"` (stress on the first 'о')
3. Save, build, and deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Thanks to all contributors and users who help improve this tool
- Inspired by the need for better Russian pronunciation resources

---

Created by [DenisSud](https://github.com/DenisSud)
