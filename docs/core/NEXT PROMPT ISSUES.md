### **Documentation and Distribution issues**

- **Vibe coding issues:**
    - docs\guidesForVibers\LLM_ONBOARDING_CONTEXT.md 
provides a manditory reading of 
    - docs\core\llm-system-context.md

However, our script, create-dist.ps1, located in the root directory, On my asking removed all docs/core/ docs.   
Should we include this file, what about others? I don't believe most of the docs in docs/core are files that should be provided with the repo.  

### **Documentation DEEP DIVE**:

Please do a documentation DEEP DIVE and investigate these files very carefully to ensure that the distribution version includes all the necessary docs, (Currently including all files in "C:\Users\danny\CascadeProjects\HatsOffMVP\saastastic\GUIDES" )and all files in "C:\Users\danny\CascadeProjects\HatsOffMVP\saastastic\docs\guidesForVibers"

Make sure that the files we send them address all the information they need, and reference no files we aren't giving them.  If they do, we need to either provide the files in question, or remove the reference and provide the needed information elsewhere.

### **Licensing**
Licensing Schema migration:
we added licensing to the schema.  This was originally done for us to create licenses for our customers, but upon further thinking this will not be how we are doing that to start with.

- Did we create all the code necessary for the licensing feature?
- Do we remove the licensing migration or any other code? 
- Can we do that? 
- Should we do that? 
- Is that a useful feature to provide with SaaStastic?
- If so, do we need to include a documentation file/guide to show how to use it, as well as when this might be useful (user stories/exapmles as to why or when it would be used.)

### **Vibe Coding Tips**
Here is a file I started creating with Puzzle pieces for prompts.
My vision with it is having multiple sections of prompts so that they can be copied and pasted and stacked together to create much more productive AI chat sessions or agentic coding sessions like that in Cascade.
guidesForVibers/VibeCodingTips.md