import Header from "@/Components/Header/Header";
import Storage from "@/Components/Storage/Storage";
import LatestFiles from "@/Components/LatestFiles/LatestFiles";

export default function DashboardHome() {
  return (
    <>
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-2">
        <Storage />
        <LatestFiles />
      </div>
    </>
  );
}
