export default function PortfolioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 overflow-y-auto overflow-x-hidden">
            {children}
        </div>
    );
}
