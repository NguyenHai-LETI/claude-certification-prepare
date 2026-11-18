// Poll an AI job (GET /api/ai/jobs/:id?since=n every ~700 ms while running), accumulating its log.
import { useCallback, useEffect, useRef, useState } from 'react';
import { api, enc } from './api.ts';
import type { AiJob } from '../../shared/types.ts';

export const JOB_POLL_MS = 700;

export function useAiJob(jobId: string | undefined, initial?: AiJob) {
  const [job, setJob] = useState<AiJob | undefined>(initial);
  const [error, setError] = useState<string>();
  const logRef = useRef<string[]>(initial?.log ?? []);

  useEffect(() => {
    if (!jobId) {
      setJob(undefined);
      logRef.current = [];
      return;
    }
    let stop = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (initial?.id !== jobId) logRef.current = [];
    const tick = async () => {
      try {
        const j = await api.get<AiJob>(`/api/ai/jobs/${enc(jobId)}?since=${logRef.current.length}`);
        if (stop) return;
        // the server returns log.slice(since); be tolerant of a server that sends the whole log
        const total = j.logTotal ?? logRef.current.length + j.log.length;
        if (j.log.length >= total) logRef.current = [...j.log];
        else logRef.current = [...logRef.current, ...j.log];
        setJob({ ...j, log: logRef.current });
        setError(undefined);
        if (j.status === 'running') timer = setTimeout(tick, JOB_POLL_MS);
      } catch (e) {
        if (stop) return;
        setError((e as Error).message);
        timer = setTimeout(tick, JOB_POLL_MS * 4);
      }
    };
    void tick();
    return () => {
      stop = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId]);

  const cancel = useCallback(async () => {
    if (!jobId) return;
    await api.post(`/api/ai/jobs/${enc(jobId)}/cancel`, {});
  }, [jobId]);

  return { job, error, cancel };
}

export const JOB_STATUS_LABEL: Record<AiJob['status'], string> = {
  running: 'Đang chạy',
  done: 'Xong',
  error: 'Lỗi',
  cancelled: 'Đã huỷ',
};
