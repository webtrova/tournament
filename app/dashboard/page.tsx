export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="md:flex md:justify-between md:items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Tournament Dashboard
        </h1>
        <div className="mt-4 md:mt-0">
          <button className="bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-md">
            New Tournament
          </button>
        </div>
      </div>

      {/* Tournament Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Active Players</h3>
          <p className="text-3xl font-bold text-brand-blue">64</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">
            Matches Completed
          </h3>
          <p className="text-3xl font-bold text-brand-blue">24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Current Round</h3>
          <p className="text-3xl font-bold text-brand-blue">2</p>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Matches
          </h2>
        </div>
        <div className="divide-y">
          {[1, 2, 3].map((match) => (
            <div key={match} className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Player A</span>
                  <span className="text-brand-red">vs</span>
                  <span className="font-medium">Player B</span>
                </div>
                <span className="text-gray-500">2 hours ago</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
