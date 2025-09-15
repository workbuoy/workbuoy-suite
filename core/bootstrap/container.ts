// simplified container (excerpt)
import { isPersistenceOn } from '../persistence/FeatureFlags';
import { ContactsMemoryRepo } from '../persistence/memory/ContactsMemoryRepo';
import { TasksMemoryRepo } from '../persistence/memory/TasksMemoryRepo';

export function makeRepos() {
  if (!isPersistenceOn()) {
    return { contacts: new ContactsMemoryRepo(), tasks: new TasksMemoryRepo() };
  }
  // TODO wire postgres repos (PR3)
  return { contacts: new ContactsMemoryRepo(), tasks: new TasksMemoryRepo() };
}
