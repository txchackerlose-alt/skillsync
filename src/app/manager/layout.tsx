import AppLayout from '@/components/layout/AppLayout';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout role="manager" title="Manager Dashboard">
      {children}
    </AppLayout>
  );
}
