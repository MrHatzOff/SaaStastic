# Attribution

This workflow system is based on the **ai-dev-tasks** methodology created by Ryan Carson.

**Original Repository**: [https://github.com/snarktank/ai-dev-tasks](https://github.com/snarktank/ai-dev-tasks)

**License**: Apache License 2.0

---

## Apache License 2.0 Notice

Copyright for the original ai-dev-tasks methodology belongs to Ryan Carson and contributors.

The original work is licensed under the Apache License, Version 2.0 (the "License");
you may not use these files except in compliance with the License.

You may obtain a copy of the License at:
http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

---

## Modifications Made for SaaStastic

The SaaStastic team has adapted the original ai-dev-tasks methodology with the following modifications:

### **Adaptations**:
1. **Multi-Tenant Architecture** - Added sections for `companyId` scoping requirements
2. **RBAC Integration** - Included permission requirements in PRD templates
3. **Security Checklist** - Added security verification steps specific to multi-tenant SaaS
4. **SaaStastic File Structure** - Adapted file paths to match SaaStastic's safe zones
5. **Technology Stack** - Customized for Next.js 15, Prisma 6, Clerk, and Stripe
6. **Testing Requirements** - Added tenant isolation tests to execution protocol

### **Files Adapted**:
- `create-prd.md` - Enhanced with multi-tenant and RBAC sections
- `generate-tasks.md` - Modified to include security checkpoints
- `process-tasks.md` - Updated with SaaStastic-specific commit and testing protocols

### **Original Concepts Preserved**:
- Three-phase workflow (PRD → Tasks → Execution)
- Iterative refinement with clarifying questions
- Two-phase task generation (parent tasks, then sub-tasks)
- One-task-at-a-time execution with approval gates
- Test-then-commit protocol

---

## Gratitude

We are grateful to Ryan Carson for creating and open-sourcing this excellent workflow system.
His methodology has significantly improved how we build features with AI assistance.

---

## Using This Work

Under the Apache 2.0 License, you are free to:
- ✅ Use these workflows commercially
- ✅ Modify them for your needs
- ✅ Distribute them
- ✅ Include them in your projects

**Requirements**:
- Include this attribution file
- Include a copy of the Apache 2.0 license
- State significant changes made

---

**Thank you, Ryan Carson, for your contribution to the developer community!** 🙏

**Last Updated**: October 14, 2025
