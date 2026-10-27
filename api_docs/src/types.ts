export interface PropertyDoc {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
  getterSetter?: string;
}

export interface MethodParam {
  name: string;
  type: string;
  defaultValue?: string;
  optional?: boolean;
  description?: string;
}

export interface MethodDoc {
  name: string;
  returns: string;
  params: MethodParam[];
  description: string;
  example?: string;
}

export interface SignalArg {
  name: string;
  type: string;
}

export interface SignalDoc {
  name: string;
  args: SignalArg[];
  description: string;
}

export interface ConstantDoc {
  name: string;
  value: string;
  description: string;
}

export interface TutorialLink {
  title: string;
  url?: string;
}

export interface ClassDoc {
  name: string;
  category: string;
  inherits?: string;
  inheritedBy?: string[];
  brief: string;
  description: string;
  codeExample?: string;
  properties: PropertyDoc[];
  methods: MethodDoc[];
  signals: SignalDoc[];
  constants?: ConstantDoc[];
  commonPitfalls?: string[];
  tutorials?: TutorialLink[];
}

export interface CategoryGroup {
  id: string;
  title: string;
  classes: string[];
}
