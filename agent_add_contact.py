"""
Agent: Add Contact Us section with Google Maps to Imperial Pavilion website.

Uses the Anthropic SDK tool-use loop to read the site files, generate the
Contact Us section HTML/CSS, and write the changes back.

Usage:
    pip install anthropic
    python agent_add_contact.py
"""

import anthropic
from pathlib import Path

BASE_DIR = Path(__file__).parent
INDEX_HTML = BASE_DIR / "index.html"
STYLES_CSS = BASE_DIR / "styles.css"

TOOLS = [
    {
        "name": "read_file",
        "description": "Read the full contents of a file and return as a string.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Absolute or relative file path"}
            },
            "required": ["path"],
        },
    },
    {
        "name": "write_file",
        "description": "Overwrite a file with new content.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Absolute or relative file path"},
                "content": {"type": "string", "description": "Complete new file content"},
            },
            "required": ["path", "content"],
        },
    },
]

SYSTEM_PROMPT = """You are a front-end developer maintaining a single-page restaurant website
for Imperial Pavilion (帝苑), a fine Chinese restaurant in Singapore.

The site uses pure HTML/CSS/JS — no frameworks, no build tools.
Design palette: lacquer crimson (#8B1A2B / #C4283E), imperial gold (#C9A84C), near-black (#0D0305).
Fonts: Noto Serif SC (serif headings), Josefin Sans (sans body).
CSS custom properties are defined in :root in styles.css.

Follow the existing code conventions exactly — no new abstractions, no comments,
match indentation and naming style."""


def run_tool(name: str, tool_input: dict) -> str:
    if name == "read_file":
        try:
            return Path(tool_input["path"]).read_text(encoding="utf-8")
        except Exception as exc:
            return f"ERROR: {exc}"
    if name == "write_file":
        try:
            Path(tool_input["path"]).write_text(tool_input["content"], encoding="utf-8")
            return f"Written: {tool_input['path']}"
        except Exception as exc:
            return f"ERROR: {exc}"
    return f"Unknown tool: {name}"


def main() -> None:
    client = anthropic.Anthropic()

    user_prompt = f"""Add a 'Contact Us' section to the Imperial Pavilion website.

Files to edit:
  index.html : {INDEX_HTML}
  styles.css  : {STYLES_CSS}

Restaurant details:
  Address : 8 Ann Siang Hill, Singapore 069790
  Phone   : +65 6888 9999
  Email   : reservations@imperialpavilion.sg

What to do — step by step:
1. Read both files.
2. In index.html:
   a. Add <li><a href="#contact" class="nav-link">Contact</a></li> to the nav
      (after the Testimonials link, before the Reserve CTA).
   b. Insert a new <section id="contact"> block between #reservations and #footer.
      The section must contain:
        - section-eyebrow / h2 heading ("Contact Us <span lang='zh'>联系我们</span>")
        - section-divider
        - .contact-layout grid with two columns:
            Left  – .contact-info with three .contact-item divs
                    (Address, Reservations phone+email, Opening Hours)
            Right – .contact-map containing a Google Maps <iframe>
      Use this embed src (no API key needed):
        https://maps.google.com/maps?q=8+Ann+Siang+Hill+Singapore+069790&output=embed
      The iframe must have title and aria-label attributes for accessibility.
3. In styles.css:
   - Add a #contact rule that reuses the same lattice background-image as #menu.
   - Add .contact-layout (2-col grid, 1fr 1.5fr, responsive 1-col below 768 px).
   - Add .contact-info, .contact-item, .contact-label, .contact-hours,
     .contact-map (with the shimmer top-border ::before already used on .form-container),
     and .contact-map iframe rules.
   - All colours must come from existing CSS custom properties.
   - Add @media (max-width: 768px) {{ .contact-layout {{ grid-template-columns: 1fr; }} }}
     inside the existing 768 px media query block.
4. Write both modified files back.
5. Confirm what was changed."""

    messages: list[dict] = [{"role": "user", "content": user_prompt}]

    print("▶ Agent starting…\n")

    while True:
        response = client.messages.create(
            model="claude-opus-4-8",
            max_tokens=8192,
            thinking={"type": "adaptive"},
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=messages,
        )

        messages.append({"role": "assistant", "content": response.content})

        for block in response.content:
            if block.type == "text":
                print(block.text)

        if response.stop_reason == "end_turn":
            break

        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    print(f"  🔧 {block.name}({list(block.input.keys())})")
                    result = run_tool(block.name, block.input)
                    print(f"     → {result[:80]}{'…' if len(result) > 80 else ''}")
                    tool_results.append(
                        {
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result,
                        }
                    )
            messages.append({"role": "user", "content": tool_results})

    print("\n✅ Agent finished.")


if __name__ == "__main__":
    main()
