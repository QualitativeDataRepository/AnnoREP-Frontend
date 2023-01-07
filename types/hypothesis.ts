export interface IHypothesisGroup {
  id: string
  name: string
  type: string
}

export interface IHypothesisAnnotationPermissions {
  read: string[]
  delete: string[]
  //among other permission types
}
export interface IHypothesisPostAnnotationBodySchema {
  uri: string
  document?: any
  text?: string
  tags?: string[]
  group?: string
  permissions?: Partial<IHypothesisAnnotationPermissions>
  target?: any[]
  references?: string[]
}

export interface IHypothesisAnnotation {
  id: string
  created: string
  updated: string
  user: string
  uri: string
  text: string
  tags: string[]
  group: string
  permissions: IHypothesisAnnotationPermissions
  target: any[]
  links: any
  hidden: boolean
  flagged: boolean
  references: string[]
  user_info: any
}
