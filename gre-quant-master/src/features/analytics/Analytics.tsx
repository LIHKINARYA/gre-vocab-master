import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAppStore } from '@/store/useAppStore';
import { StatCard } from '@/features/dashboard/StatCard';

const inkSoft = '#5b6478';

export function Analytics() {
  const data = useAnalyticsData(14);
  const dashboard = useDashboardStats();
  const quizzesCompleted = useAppStore((s) => s.progress.quizzesCompleted);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-(--color-gold) font-semibold">Analytics</p>
        <h1 className="font-display text-3xl font-semibold text-(--color-ink) dark:text-(--color-paper)">
          Your Study Data
        </h1>
      </motion.header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard index={0} label="Overall Accuracy" value={data.overallAccuracy} suffix="%" accent="var(--color-verdigris)" />
        <StatCard index={1} label="Total Attempts" value={data.totalReviews} accent="var(--color-ink)" />
        <StatCard index={2} label="Current Streak" value={dashboard.currentStreak} suffix="days" accent="var(--color-gold)" />
        <StatCard index={3} label="Quizzes Taken" value={quizzesCompleted} accent="var(--color-gold)" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5 mb-6"
      >
        <p className="font-display text-lg font-semibold mb-4">Last 14 days</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailySeries} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={inkSoft} opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: inkSoft }} />
              <YAxis tick={{ fontSize: 11, fill: inkSoft }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-paper)',
                  border: '1px solid rgba(22,33,61,0.15)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="reviews" name="Attempts" stroke="#b8862b" strokeWidth={2} dot={false} />
              <Line
                type="monotone"
                dataKey="newProblems"
                name="New problems"
                stroke="#3e7c74"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                name="Accuracy %"
                stroke="#a34a3a"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5"
        >
          <p className="font-display text-lg font-semibold mb-4">Mastery breakdown</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.masteryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {data.masteryBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-paper)',
                    border: '1px solid rgba(22,33,61,0.15)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5"
        >
          <p className="font-display text-lg font-semibold mb-4">Progress by difficulty</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.difficultyBreakdown} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={inkSoft} opacity={0.15} />
                <XAxis dataKey="difficulty" tick={{ fontSize: 11, fill: inkSoft }} />
                <YAxis tick={{ fontSize: 11, fill: inkSoft }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-paper)',
                    border: '1px solid rgba(22,33,61,0.15)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="attempted" name="Attempted" fill="#3e7c74" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" name="Total" fill="#b8862b" opacity={0.35} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl border border-(--color-ink)/10 dark:border-(--color-paper)/10 bg-white/60 dark:bg-white/5 p-5"
      >
        <p className="font-display text-lg font-semibold mb-4">Accuracy by topic</p>
        <p className="text-xs text-(--color-slate) mb-3">
          The lowest bars are where cramming will help you the most.
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topicAccuracy} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={inkSoft} opacity={0.15} />
              <XAxis dataKey="topic" tick={{ fontSize: 10, fill: inkSoft }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: inkSoft }} domain={[0, 100]} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-paper)',
                  border: '1px solid rgba(22,33,61,0.15)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value, name, props) => [
                  `${value}% (${props.payload.attempts} attempts)`,
                  name,
                ]}
              />
              <Bar dataKey="accuracy" name="Accuracy" fill="#a34a3a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
