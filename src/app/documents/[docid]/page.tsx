"use client"

import {useState, useEffect} from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import {useRouter} from "next/navigation"

const DocumentPage: React.FC = ({params}: any) => {
  const [content, setContent] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const id = params.docid
  const router = useRouter()
  useEffect(() => {
    if (id) {
      const fetchDocument = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3001/api/documents/${id}`
          )
          setContent(response.data.content)
        } catch (error) {
          console.error("Failed to fetch document", error)
        }
      }

      fetchDocument()
    }
  }, [id])

  useEffect(() => {
    if (id) {
      const fetchDocument = async () => {
        try {
          const response = await axios.get(
            `http://localhost:3001/api/node/${id}`
          )
          setName(response.data.label)
        } catch (error) {
          console.error("Failed to fetch document", error)
        }
      }

      fetchDocument()
    }
  }, [id])

  const handleSave = async () => {
    if (id) {
      try {
        await axios.put(`http://localhost:3001/api/documents/${id}`, {content})
        setIsEditing(false)
      } catch (error) {
        console.error("Failed to save document", error)
      }
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleLinkClick = async (linkName: string) => {
    console.log("button clicked", {name: linkName, parentId: id})
    try {
      const response = await axios.post(
        "http://localhost:3001/api/documents/link",
        {name: linkName, parentId: id}
      )
      const newDocument = response.data
      router.push(`/documents/${newDocument._id}`)
    } catch (error) {
      console.error("Failed to handle link click", error)
    }
  }

  const renderLink = (linkName: string) => {
    console.log(
      `<a href="#" onclick="event.preventDefault(); handleLinkClick('${linkName}')" class="text-blue-500 underline cursor-pointer">${linkName}</a>`
    )

    return `<a href="#" onclick="event.preventDefault(); handleLinkClick('${linkName}')" class="text-blue-500 underline cursor-pointer">${linkName}</a>`
  }

  const renderMarkdown = (markdown: string) => {
    const regex = /\[\[(.*?)\]\]/g
    return markdown.replace(regex, (_, linkName) => {
      return renderLink(linkName)
    })
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-black text-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h1 className="text-xl font-bold mb-4"> {name}</h1>
        {isEditing ? (
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full p-4 bg-black text-white border border-black rounded-lg focus:outline-none"
            />
            <button
              onClick={handleSave}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-300"
            >
              Save
            </button>
          </div>
        ) : (
          <div>
            <ReactMarkdown
              className="text-white"
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                a: ({node, ...props}) => (
                  <a
                    {...props}
                    onClick={(e) => {
                      e.preventDefault()
                      handleLinkClick(props.children)
                    }}
                  />
                ),
              }}
            >
              {renderMarkdown(content)}
            </ReactMarkdown>
            <button
              onClick={handleEdit}
              className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-300"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentPage
