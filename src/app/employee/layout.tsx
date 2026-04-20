import AppLayout from '@/components/layout/AppLayout';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout role="employee" title="Employee Dashboard">
      {children}
    </AppLayout>
  );
}
