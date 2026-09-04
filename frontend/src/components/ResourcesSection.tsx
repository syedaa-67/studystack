import { useEffect, useState } from "react";
import { listResources } from "../api/resources";
import type { ResourceRead } from "../api/resources";
import NewResourceModal from "./NewResourceModal";
import ResourceDetailModal from "./ResourceDetailModal";

interface Props {
  groupId: number;
  currentMemberId: number | null;
}

const typeIcon: Record<string, string> = { note: "\u{1F4DD}", link: "\u{1F517}", file: "\u{1F4CE}" };

export default function ResourcesSection({ groupId, currentMemberId }: Props) {
  const [resources, setResources] = useState<ResourceRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = () => {
    listResources(groupId)
      .then(setResources)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [groupId]);

  return (
    <div className="mt-10 ">
      <div className="flex justify-between items-center mb-6 ">
        <div className="flex items-center gap-2"><h2 className="text-xl font-semibold ">Resources</h2><span className="bg-yellow-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">{resources.length}</span></div>
        <button
          onClick={() => setShowNew(true)}
          className="bg-yellow-400 text-slate-900 font-semibold rounded-lg px-6 py-3 hover:bg-yellow-300 transition "
        >
          + New Resource
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm ">Loading resources...</p>
      ) : resources.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 text-center text-slate-400 ">
          No resources shared yet. Add a note, link, or file for the group.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {resources.map((r) => (
            <button
              key={r.id}
              onClick={() => setOpenId(r.id)}
              className="text-left bg-white/5 backdrop-blur-lg rounded-xl p-5 border border-white/10 hover:border-yellow-400/30 transition "
            >
              <div className="flex items-center gap-2 mb-2 ">
                <span>{typeIcon[r.resource_type]}</span>
                <span className="bg-yellow-400/10 text-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-full capitalize ">
                  {r.resource_type}
                </span>
              </div>
              <p className="font-medium text-sm ">{r.title}</p>
              <p className="text-slate-500 text-xs mt-2 ">
                v{r.current_version_number} &middot; {new Date(r.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}

      {showNew && (
        <NewResourceModal
          groupId={groupId}
          createdById={currentMemberId}
          onClose={() => setShowNew(false)}
          onCreated={load}
        />
      )}

      {openId !== null && (
        <ResourceDetailModal
          resourceId={openId}
          memberId={currentMemberId}
          onClose={() => setOpenId(null)}
          onChanged={load}
        />
      )}
    </div>
  );
}
