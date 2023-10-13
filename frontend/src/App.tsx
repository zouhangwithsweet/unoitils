import { useCallback, useState } from 'react'
import { SelectFile, Convert, SaveResult } from '../wailsjs/go/main/App'

function App() {
  const [filePath, setFilePath] = useState('Please select excel')
  const [textTemplate, setTextTemplate] = useState(`{
    "headerTitle": "司机师傅注意啦，自2023年10月1日起，花小猪将针对长期伙伴活动门槛进行调整。",
    "topBlockTitles": [
      "10月1日起",
      "每月任务升级",
      "-完单任务调整-"
    ],
    "desc": [
      "完单量由{$0}单调至{$1}单",
      "峰期完单量由{$0}单调至{$1}单",
      "指派成交率由{$0}调至{$1}",
      "月度指派成交率由{$0}调至{$1}",
      "月度在线时长由{$0}小时调至{$1}小时",
      "合规任务由人或车证合规调至人车证双合规"
    ],
    "notice": "在法律允许并且不损害您合法权益的前提下，小猪长期伙伴活动门槛随季节等综合原因调整。",
    "headImg": "https://gift-static.hongyibo.com.cn/static/kfpub/5500/head_icon.jpg"
  }`)

  async function getFile() {
    setFilePath(await SelectFile())
  }

  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const resetHandler = useCallback(() => {
    setResult('')
    setFilePath('')
  }, [])

  // compares
  const [pairs, setPairs] = useState<[number, number][]>([
    [5, 11],
    [6, 12],
    [7, 13],
    [8, 14],
    [9, 15],
    [10, 16],
  ])

  return (
    <div className="relative min-h-100vh pb-6">
      <div className="px-4 h-12 flex items-center border-b-1 border-#ececec font-bold text-#18181b">Excel to Json</div>
      <div className="px-4 py-2 flex items-center">
        <button
          className="self-center flex items-center justify-center mr-3 h-9 px-3 shadow rounded-md bg-#18181b text-#fafafa hover:bg-#18181b/80 active:bg-#18181b/80 text-sm font-medium"
          onClick={() => {
            getFile()
          }}
        >
          Select file
        </button>
        <span className="text-#71717a font-bold text-sm underline underline-current">{filePath}</span>
        <span className="text-#ef4444 text-sm">{error}</span>
        <span className="flex-1 flex justify-end gap-1">
          <button
            className="self-center flex items-center justify-center h-9 px-3 shadow rounded-md bg-#ef4444 text-#fafafa hover:bg-#ef4444/80 active:bg-#ef4444/80 text-sm font-medium"
            onClick={async () => {
              try {
                if (!filePath || filePath === 'Please select excel' || !textTemplate || !pairs.length) return
                setResult(await Convert(textTemplate, pairs))
              } catch (error) {
                // setError(error as string)
              }
            }}
          >
            {result && <span className="w-4 h-4 mr-2 i-lucide:check-circle" />}
            {result ? 'Succeed' : 'Convert'}
          </button>
          {result && (
            <>
              <button
                className="self-center flex items-center justify-center h-9 px-3 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 border bg-transparent shadow-sm hover:bg-#eee"
                onClick={() => {
                  SaveResult(result)
                }}
              >
                <span className="w-4 h-4 mr-2 i-lucide:download"></span>
                Download
              </button>
              <button
                className="self-center flex items-center justify-center h-9 px-2.5 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 border bg-transparent shadow-sm hover:bg-#eee"
                onClick={resetHandler}
              >
                <span className="w-4 h-4 i-lucide:circle-off"></span>
              </button>
            </>
          )}
        </span>
      </div>

      <div className="px-4 flex flex-col items-stretch">
        <label className="text-sm font-bold text-left">Compare column index pairs</label>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {pairs.map((pair, index) => (
            <>
              <div key={index} className="flex items-center gap-1.5 [&_input]:w-10">
                <input
                  value={pair[0]}
                  className="flex h-8 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="w-4 h4 i-lucide:git-compare"></span>
                <input
                  value={pair[1]}
                  className="flex h-8 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              {index !== pairs.length - 1 && <span className="mx-2 h-4 border-l border-solid"></span>}
            </>
          ))}
          <span
            className="w-4 h-4 cursor-pointer i-lucide:plus-circle"
            onClick={() => {
              setPairs((prev) => [...prev, [0, 0]])
            }}
          ></span>
        </div>
      </div>
      <hr className="mt-2 mx-4" />
      <div className="mt-2 px-4">
        <textarea
          value={textTemplate}
          onChange={(e) => setTextTemplate(e.target.value)}
          className="flex min-h-60vh w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <a
        href="dchat://im/start_conversation?name=zouhang"
        className="absolute flex items-center right-4 bottom-4 text-#71717a text-sm"
      >
        <span className="w-4 h-4 mr-1 i-lucide:help-circle"></span>
        Need help
      </a>
    </div>
  )
}

export default App
