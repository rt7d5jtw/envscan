import { readFileSync } from "fs";
import { resolve } from "path";

// SPEC:
// https://hexdocs.pm/dotenvy/dotenv-file-format.html

interface Tokenizer {
  readonly source: string;
  cursor: number;
  line: number;
  tokens: Map<string, string>;

  tokenize: () => Map<string, string>;
}

class TokenizerImpl implements Tokenizer {
  public readonly source: string;
  public cursor: number;
  public line: number;
  public tokens: Map<string, string>;

  public constructor(sourceFile: string) {
    this.source = sourceFile;
    this.cursor = 0;
    this.line = 0;
    this.tokens = new Map();
  }

  // alternative method for tokenizing
  public tokenize(): Map<string, string> {
    while (!this.isEOF()) {
      switch (this.peek()) {
        case ' ': {
          while (this.peek().charCodeAt(0) == 32) {
            this.cursor += 1;
          }
          break;
        }
        case "\n": {
          this.cursor += 1;
          this.line += 1;
          break;
        }
        case "=": {
        }
        // Comments '#'
        case '#': {
          while (this.peek() != '\n') {
            this.cursor += 1;
          }
        }
        case "\r": {
        }
        case "\t": {
        }
        default: {
          // isAlpha case
          if (this.isAlphabetic(this.peek())) {
            this.readKVPair();
          }
          // isDigit case
          if (this.isAlphabetic(this.peek())) {
          }
        }
      }
    }

    return this.tokens;
  }

  private readKVPair() {
    let key = '';
    let value = '';

    while (this.peek() != '\n') {
      // Read the key
      while (this.peek() != '=') {
        if (this.peek() != ' ') {
          key += this.peek();
        }

        this.cursor += 1;
      }

      // Read the value
      if (this.peek() == '=') {
        // Move the cursor from `=`
        this.cursor += 1;

        // Handle possible multiline comments like RSA keys
        if (this.peek() == '"') {
          // Move the cursor from `"`
          this.cursor += 1;

          while (this.peek() != '"') {
            value += this.peek();
            this.cursor += 1;
          }

          // Add the final `"`
          this.cursor += 1;

          break;
        }

        while (this.peek() != '\n') {
          // Skip comments
          if (this.peek() == ';' || this.peek() == '#') {
            while (
              this.source[this.cursor] != '\n' &&
              !this.isEOF()
            ) {
              this.cursor += 1;
            }

          } else if (this.peek() == '$' && this.peekAhead() == '{') {
            // Variable expansion case
            // 1. Check the already parsed variables
            // 2. Check the environment variables
            // 3. If there is no variable to expand upon, then we just use it as it is
            //
            // NOTE: The scanner prioritizes the .env variables included in the file
            // first and the variables defined in the environment second.
            // This means that USER variable defined in the file will override USER
            // variable in the environment.

            //this.isInterpolated()
            let interpolated = ''

            // Forward the cursor from '${'
            this.cursor += 2

            while (this.peek() != '}') {
              interpolated += this.peek();
              this.cursor += 1
            }

            // Check if value is already parsed value from the .env file
            const parsedVariable = this.tokens.get(interpolated)

            // Concatenate into the string
            if (parsedVariable) {
              value += parsedVariable
            } else if (parsedVariable == undefined) {
              // Returns undefined if not defined
              const env: string | undefined = process.env[interpolated]

              // If there is no such variable to expand upon,
              // concatenate the string as it is.
              env == undefined
                ? value += interpolated
                : value += env
            }

          } else {
            value += this.peek();
          }

          this.cursor += 1;
        }

        break;
      }

      this.cursor += 1;
    }

    value = value.trim();
    this.tokens.set(key, value);
  }

  /**
   * Returns current character by cursor position
   * @returns {string}
   */
  private peek(): string {
    return this.source[this.cursor] as string;
  }

  /**
   * Lookahead method
   * Returns next character
   * @returns {string}
   */
  private peekAhead(): string | undefined {
    return this.source[this.cursor + 1];
  }

  /**
   * Checks if character is alphabetic
   */
  private isAlphabetic(c: string): boolean {
    if (c == undefined)
      throw new Error(
        `[ERROR] [Tokenizer.isAlphabetic()] Input was undefined!`
      );

    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_";
  }

  /**
   * Checks if the cursor has reached EOF.
   */
  private isEOF(): boolean {
    return this.cursor === this.source.length;
  }
}

/**
 * Synchronously reads the file through {readFileSync}
 * Returns the file contents of the resolved file.
 * For example: filePath = .env
 * @param {string} filePath
 * @return Buffer
 */
function loadFile(filePath: string): string {
  let buffer;
  try {
    // Assumes utf-8
    const resolvedFilePath: string = resolve(process.cwd(), filePath);
    buffer = readFileSync(resolvedFilePath, {
      encoding: "utf-8",
      flag: "r",
    });
  } catch (err) {
    console.warn(`Failed to load the ${filePath}:`, err);
    return '';
  }

  return buffer;
}

export { TokenizerImpl, loadFile };
